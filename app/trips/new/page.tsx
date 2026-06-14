"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VibeTag, TravelStyle, BudgetLevel } from "../../lib/types";
import { createTrip } from "../../lib/api";
import { VIBE_CONFIG } from "../../lib/mock-data";
import { useRequireAuth } from "../../contexts/AuthContext";
import CitySearch from "../../components/CitySearch";

const COMPANION_OPTIONS: { label: string; value: TravelStyle }[] = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Group", value: "group" },
  { label: "Family", value: "family" },
];

const BUDGET_OPTIONS: { label: string; value: BudgetLevel }[] = [
  { label: "Budget", value: "backpacker" },
  { label: "Mid-range", value: "mid" },
  { label: "Luxury", value: "luxury" },
];

function ChipSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: selected ? "#F0E6D8" : "#F2EFE9",
              border: `1px solid ${selected ? "#C4773B" : "#E8E2D9"}`,
              borderRadius: "9999px",
              color: selected ? "#C4773B" : "#2C2825",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function VibeSelector({ value, onChange }: { value: VibeTag | ""; onChange: (v: VibeTag) => void }) {
  const vibes: VibeTag[] = ["loved_it", "mixed", "never_again", "neutral"];
  return (
    <div className="flex flex-wrap gap-2">
      {vibes.map((v) => {
        const cfg = VIBE_CONFIG[v];
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: selected ? cfg.bg : "#F2EFE9",
              border: `1px solid ${selected ? cfg.dot : "#E8E2D9"}`,
              borderRadius: "9999px",
              color: selected ? cfg.text : "#2C2825",
              cursor: "pointer",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selected ? cfg.dot : "#8C8279" }} />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${focused ? "#C4773B" : "#E8E2D9"}`,
    borderRadius: "4px",
    color: "#2C2825",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: "1rem",
    outline: "none",
    boxShadow: focused ? "0 0 0 3px #F0E6D8" : "none",
    width: "100%",
    padding: "10px 14px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };
}

export default function LogTripPage() {
  const auth = useRequireAuth();
  const router = useRouter();

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vibe, setVibe] = useState<VibeTag | "">("");
  const [notes, setNotes] = useState("");
  const [highlight, setHighlight] = useState("");
  const [lowlight, setLowlight] = useState("");
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | "">("");
  const [budget, setBudget] = useState<BudgetLevel | "">("");
  const [focused, setFocused] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function f(name: string) {
    return {
      style: inputStyle(focused === name),
      onFocus: () => setFocused(name),
      onBlur: () => setFocused(null),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!country) return;
    setSubmitting(true);
    setError("");
    try {
      const trip = await createTrip({
        city: city || null,
        country,
        start_date: startDate || null,
        end_date: endDate || null,
        vibe: vibe || null,
        notes: notes || null,
        highlight: highlight || null,
        lowlight: lowlight || null,
        would_return: wouldReturn,
        travel_style: travelStyle || null,
        budget_level: budget || null,
        is_public: false,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trip");
      setSubmitting(false);
    }
  }

  if (!auth) return null;

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Left — form */}
        <div className="flex-1 lg:w-[55%] px-6 py-10 lg:px-12 overflow-y-auto">
          <div style={{ maxWidth: "560px" }}>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              Log a trip
            </h1>
            <p className="text-sm mb-10" style={{ color: "#8C8279" }}>
              Save this memory before it fades.
            </p>

            {error && (
              <div className="px-4 py-3 text-sm mb-6 rounded-md" style={{ backgroundColor: "#FDEAEA", color: "#8A3535", border: "1px solid #B5696A" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              {/* City & Country search */}
              <CitySearch
                city={city}
                country={country}
                required
                onSelect={(r) => {
                  setCity(r.city);
                  setCountry(r.country);
                }}
              />

              {/* Dates */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>From</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} {...f("start")} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>To</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} {...f("end")} />
                </div>
              </div>

              {/* Vibe */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>How did you feel about it?</label>
                <VibeSelector value={vibe} onChange={setVibe} />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Your notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What do you remember most? A smell, a street, a meal, a feeling..."
                  rows={5}
                  style={{
                    ...inputStyle(focused === "notes"),
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.125rem",
                    lineHeight: 1.8,
                    resize: "vertical",
                    minHeight: "120px",
                  }}
                  onFocus={() => setFocused("notes")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* Highlight / Lowlight */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Highlight</label>
                <input type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="The best part…" {...f("highlight")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Lowlight</label>
                <input type="text" value={lowlight} onChange={(e) => setLowlight(e.target.value)} placeholder="The one thing you'd change…" {...f("lowlight")} />
              </div>

              {/* Would return */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Would you return?</label>
                <div className="flex gap-2">
                  {([true, false] as const).map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setWouldReturn(wouldReturn === val ? null : val)}
                      className="px-4 py-2 text-sm font-medium transition-all"
                      style={{
                        backgroundColor: wouldReturn === val ? "#F0E6D8" : "#F2EFE9",
                        border: `1px solid ${wouldReturn === val ? "#C4773B" : "#E8E2D9"}`,
                        borderRadius: "9999px",
                        color: wouldReturn === val ? "#C4773B" : "#2C2825",
                        cursor: "pointer",
                      }}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel style */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Who did you go with?</label>
                <ChipSelector options={COMPANION_OPTIONS} value={travelStyle} onChange={setTravelStyle} />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Budget</label>
                <ChipSelector options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !country}
                  className="px-6 py-3 text-base font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: "#C4773B",
                    borderRadius: "8px",
                    border: "none",
                    cursor: submitting || !country ? "not-allowed" : "pointer",
                    opacity: submitting || !country ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Saving…" : "Save this memory"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
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
            <p className="text-sm" style={{ color: "#8C8279" }}>Your pin will appear on the map once saved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
