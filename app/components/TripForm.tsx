"use client";

import { TravelStyle, BudgetLevel } from "../lib/types";
import { ChipSelector, inputStyle, COMPANION_OPTIONS, BUDGET_OPTIONS } from "./FormControls";
import Chapter, { StopFormState, emptyStopForm, isStopFormComplete } from "./Chapter";

export type StopEntry = { key: string; id: number | null; form: StopFormState };

export type TripFormValues = {
  title: string;
  start_date: string;
  end_date: string;
  travel_style: TravelStyle | "";
  budget_level: BudgetLevel | "";
  stops: StopEntry[];
};

export function newStopEntry(): StopEntry {
  return { key: `new-${Math.random().toString(36).slice(2)}`, id: null, form: emptyStopForm() };
}

export function emptyTripForm(): TripFormValues {
  return {
    title: "",
    start_date: "",
    end_date: "",
    travel_style: "",
    budget_level: "",
    stops: [newStopEntry()],
  };
}

export default function TripForm({
  heading,
  subheading,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  error,
}: {
  heading: string;
  subheading: string;
  value: TripFormValues;
  onChange: (next: TripFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
  error: string;
}) {
  // Backend requires dates/travel_style/budget_level on the trip, and
  // city/country/dates/vibe/would_return on every stop — none of these
  // are optional server-side, so submit stays blocked until all are set.
  const canSubmit = Boolean(
    value.start_date &&
      value.end_date &&
      value.travel_style &&
      value.budget_level &&
      value.stops.length > 0 &&
      value.stops.every((s) => isStopFormComplete(s.form))
  );

  function updateStop(key: string, form: StopFormState) {
    onChange({ ...value, stops: value.stops.map((s) => (s.key === key ? { ...s, form } : s)) });
  }

  function addStop() {
    onChange({ ...value, stops: [...value.stops, newStopEntry()] });
  }

  function removeStop(key: string) {
    onChange({ ...value, stops: value.stops.filter((s) => s.key !== key) });
  }

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Left — form */}
        <div className="flex-1 lg:w-[55%] px-6 py-10 lg:px-12 overflow-y-auto">
          <div style={{ maxWidth: "600px" }}>
            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              {heading}
            </h1>
            <p className="text-sm mb-10" style={{ color: "#8C8279" }}>{subheading}</p>

            {error && (
              <div className="px-4 py-3 text-sm mb-6 rounded-md" style={{ backgroundColor: "#FDEAEA", color: "#8A3535", border: "1px solid #B5696A" }}>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-7">
              {/* Trip-level fields */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Title (optional)</label>
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => onChange({ ...value, title: e.target.value })}
                  placeholder="Three weeks in Japan"
                  style={inputStyle(false)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>From <span style={{ color: "#C4773B" }}>*</span></label>
                  <input type="date" value={value.start_date} onChange={(e) => onChange({ ...value, start_date: e.target.value })} required style={inputStyle(false)} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>To <span style={{ color: "#C4773B" }}>*</span></label>
                  <input type="date" value={value.end_date} min={value.start_date} onChange={(e) => onChange({ ...value, end_date: e.target.value })} required style={inputStyle(false)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Who did you go with? <span style={{ color: "#C4773B" }}>*</span></label>
                <ChipSelector options={COMPANION_OPTIONS} value={value.travel_style} onChange={(v) => onChange({ ...value, travel_style: v })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Budget <span style={{ color: "#C4773B" }}>*</span></label>
                <ChipSelector options={BUDGET_OPTIONS} value={value.budget_level} onChange={(v) => onChange({ ...value, budget_level: v })} />
              </div>

              {/* Stops */}
              <div className="pt-2">
                {value.stops.map((entry) => (
                  <Chapter
                    key={entry.key}
                    mode="edit"
                    stop={entry.form}
                    onChange={(form) => updateStop(entry.key, form)}
                    onRemove={() => removeStop(entry.key)}
                    removable={value.stops.length > 1}
                  />
                ))}
                <button
                  type="button"
                  onClick={addStop}
                  className="text-sm font-medium"
                  style={{ color: "#C4773B", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  + add another city
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="px-6 py-3 text-base font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: "#C4773B",
                    borderRadius: "8px",
                    border: "none",
                    cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
                    opacity: submitting || !canSubmit ? 0.6 : 1,
                  }}
                >
                  {submitLabel}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-base font-medium"
                  style={{ backgroundColor: "transparent", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right — illustration */}
        <div
          className="lg:w-[45%] h-48 lg:h-auto lg:sticky lg:top-14 flex flex-col items-center justify-center"
          style={{ backgroundColor: "#EDE8E0", minHeight: "200px" }}
        >
          <div className="text-center px-8">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-40">
              <circle cx="32" cy="28" r="16" stroke="#C4773B" strokeWidth="2" fill="none" />
              <path d="M32 12 C32 12 20 24 20 32 C20 38.6 25.4 44 32 44 C38.6 44 44 38.6 44 32 C44 24 32 12 32 12Z" fill="#C4773B" opacity="0.2" />
              <circle cx="32" cy="28" r="5" fill="#C4773B" opacity="0.6" />
              <path d="M32 44 L32 56" stroke="#C4773B" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm" style={{ color: "#8C8279" }}>Your pins will appear on the map once saved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
