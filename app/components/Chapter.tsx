"use client";

import { TripStopPublic, TripStopCreate, VibeTag } from "../lib/types";
import { VIBE_CONFIG } from "../lib/mock-data";
import VibeChip from "./VibeChip";
import CitySearch, { CityResult } from "./CitySearch";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

export type StopFormState = {
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  vibe: VibeTag | "";
  notes: string;
  highlight: string;
  lowlight: string;
  would_return: boolean | null;
};

export function emptyStopForm(): StopFormState {
  return {
    city: "",
    country: "",
    arrival_date: "",
    departure_date: "",
    vibe: "",
    notes: "",
    highlight: "",
    lowlight: "",
    would_return: null,
  };
}

export function stopToFormState(stop: TripStopPublic): StopFormState {
  return {
    city: stop.city,
    country: stop.country,
    arrival_date: stop.arrival_date,
    departure_date: stop.departure_date,
    vibe: stop.vibe,
    notes: stop.notes ?? "",
    highlight: stop.highlight ?? "",
    lowlight: stop.lowlight ?? "",
    would_return: stop.would_return,
  };
}

// Backend requires city/country/dates/vibe/would_return on every stop —
// these vibe chips and the would-return toggle have no "unset" option there,
// so the form must collect a real answer before submit is allowed.
export function isStopFormComplete(form: StopFormState): boolean {
  return Boolean(
    form.city && form.country && form.arrival_date && form.departure_date && form.vibe && form.would_return !== null
  );
}

export function stopFormToPayload(form: StopFormState, order?: number): TripStopCreate {
  if (!isStopFormComplete(form)) {
    throw new Error("Stop form is missing required fields");
  }
  return {
    city: form.city,
    country: form.country,
    arrival_date: form.arrival_date,
    departure_date: form.departure_date,
    vibe: form.vibe as VibeTag,
    notes: form.notes || null,
    highlight: form.highlight || null,
    lowlight: form.lowlight || null,
    would_return: form.would_return as boolean,
    order,
  };
}

type ReadProps = {
  mode: "read";
  stop: TripStopPublic;
  onEdit?: () => void;
  onRemove?: () => void;
  removable?: boolean;
};

type EditProps = {
  mode: "edit";
  stop: StopFormState;
  onChange: (next: StopFormState) => void;
  onRemove?: () => void;
  removable?: boolean;
};

export default function Chapter(props: ReadProps | EditProps) {
  if (props.mode === "read") {
    const { stop, onEdit, onRemove, removable } = props;
    const vibe = stop.vibe ?? "neutral";
    return (
      <section className="pb-10 mb-10 border-b" style={{ borderColor: "#E8E2D9" }}>
        <div className="flex items-start gap-4 mb-2">
          <div className="flex-1">
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              {stop.city}
            </h2>
            <p className="text-base mt-1" style={{ color: "#8C8279" }}>{stop.country}</p>
          </div>
          <VibeChip vibe={vibe} />
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label={`Edit ${stop.city}`}
              className="text-sm"
              style={{ color: "#8C8279", background: "none", border: "none", cursor: "pointer" }}
            >
              Edit
            </button>
          )}
        </div>

        <p className="text-sm mb-6" style={{ color: "#8C8279" }}>
          {stop.arrival_date ? formatDate(stop.arrival_date) : ""}
          {stop.departure_date && stop.departure_date !== stop.arrival_date
            ? ` – ${formatDate(stop.departure_date)}`
            : ""}
        </p>

        {stop.notes && (
          <div
            className="mb-8 leading-loose"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.125rem",
              lineHeight: 1.8,
              color: "#2C2825",
              whiteSpace: "pre-wrap",
            }}
          >
            {stop.notes}
          </div>
        )}

        {(stop.highlight || stop.lowlight) && (
          <div className="mb-6 flex flex-col gap-3">
            {stop.highlight && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium mt-0.5" style={{ color: "#9A6B00", minWidth: "72px" }}>Highlight</span>
                <p className="text-sm leading-relaxed" style={{ color: "#2C2825" }}>{stop.highlight}</p>
              </div>
            )}
            {stop.lowlight && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium mt-0.5" style={{ color: "#8A3535", minWidth: "72px" }}>Lowlight</span>
                <p className="text-sm leading-relaxed" style={{ color: "#2C2825" }}>{stop.lowlight}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-sm mb-2" style={{ color: "#2C2825" }}>
          {stop.would_return ? "Would return." : "Wouldn't return."}
        </p>

        {removable && onRemove && (
          <button
            onClick={onRemove}
            className="text-sm mt-2"
            style={{ color: "#B5696A", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Remove this stop
          </button>
        )}
      </section>
    );
  }

  const { stop, onChange, onRemove, removable } = props;

  function set<K extends keyof StopFormState>(key: K, value: StopFormState[K]) {
    onChange({ ...stop, [key]: value });
  }

  function handleCitySelect(r: CityResult) {
    onChange({ ...stop, city: r.city, country: r.country });
  }

  return (
    <section className="p-6 mb-6" style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "12px" }}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
          {stop.city || "New stop"}
        </h3>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm"
            style={{ color: "#B5696A", background: "none", border: "none", cursor: "pointer" }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <CitySearch city={stop.city} country={stop.country} required onSelect={handleCitySelect} />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Arrival <span style={{ color: "#C4773B" }}>*</span></label>
            <input
              type="date"
              value={stop.arrival_date}
              onChange={(e) => set("arrival_date", e.target.value)}
              required
              style={inputStyle(false)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Departure <span style={{ color: "#C4773B" }}>*</span></label>
            <input
              type="date"
              value={stop.departure_date}
              min={stop.arrival_date}
              onChange={(e) => set("departure_date", e.target.value)}
              required
              style={inputStyle(false)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>How did you feel about it? <span style={{ color: "#C4773B" }}>*</span></label>
          <VibeSelector value={stop.vibe} onChange={(v) => set("vibe", v)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Your notes</label>
          <textarea
            value={stop.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="What do you remember most?"
            rows={5}
            style={{ ...inputStyle(false), fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.125rem", lineHeight: 1.8, resize: "vertical", minHeight: "120px" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Highlight</label>
          <input type="text" value={stop.highlight} onChange={(e) => set("highlight", e.target.value)} placeholder="The best part…" style={inputStyle(false)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Lowlight</label>
          <input type="text" value={stop.lowlight} onChange={(e) => set("lowlight", e.target.value)} placeholder="The one thing you'd change…" style={inputStyle(false)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Would you return? <span style={{ color: "#C4773B" }}>*</span></label>
          <div className="flex gap-2">
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => set("would_return", stop.would_return === val ? null : val)}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: stop.would_return === val ? "#F0E6D8" : "#FFFFFF",
                  border: `1px solid ${stop.would_return === val ? "#C4773B" : "#E8E2D9"}`,
                  borderRadius: "9999px",
                  color: stop.would_return === val ? "#C4773B" : "#2C2825",
                  cursor: "pointer",
                }}
              >
                {val ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
