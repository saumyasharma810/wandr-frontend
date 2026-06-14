"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VibeTag, TravelStyle, BudgetLevel } from "../../../lib/types";
import { getTrip, updateTrip } from "../../../lib/api";
import { VIBE_CONFIG } from "../../../lib/mock-data";
import { useRequireAuth } from "../../../contexts/AuthContext";
import CitySearch from "../../../components/CitySearch";

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
  options, value, onChange,
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
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
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
          <button key={v} type="button" onClick={() => onChange(v)}
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

export default function EditTripPage() {
  const auth = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

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
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !id) return;
    getTrip(id)
      .then((trip) => {
        setCity(trip.city ?? "");
        setCountry(trip.country ?? "");
        setStartDate(trip.start_date ?? "");
        setEndDate(trip.end_date ?? "");
        setVibe((trip.vibe as VibeTag) ?? "");
        setNotes(trip.notes ?? "");
        setHighlight(trip.highlight ?? "");
        setLowlight(trip.lowlight ?? "");
        setWouldReturn(trip.would_return ?? null);
        setTravelStyle((trip.travel_style as TravelStyle) ?? "");
        setBudget((trip.budget_level as BudgetLevel) ?? "");
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [auth, id]);

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
    setSaveError("");
    try {
      await updateTrip(id, {
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
      });
      router.push(`/trips/${id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  if (!auth) return null;

  if (loading) {
    return <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>Loading…</div>;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: "#B5696A" }}>{loadError}</p>
        <Link href="/trips" style={{ color: "#C4773B", textDecoration: "none" }}>← Back to trips</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "#E8E2D9", maxWidth: "1200px", margin: "0 auto" }}>
        <nav className="flex items-center gap-2 text-sm" style={{ color: "#8C8279" }}>
          <Link href="/trips" style={{ color: "#8C8279", textDecoration: "none" }}>My Trips</Link>
          <span>/</span>
          <Link href={`/trips/${id}`} style={{ color: "#8C8279", textDecoration: "none" }}>{city || country}</Link>
          <span>/</span>
          <span style={{ color: "#2C2825" }}>Edit</span>
        </nav>
      </div>

      <div className="px-6 py-10 lg:px-12" style={{ maxWidth: "620px", margin: "0 auto" }}>
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
          Edit trip
        </h1>
        <p className="text-sm mb-10" style={{ color: "#8C8279" }}>Update your memory.</p>

        {saveError && (
          <div className="px-4 py-3 text-sm mb-6 rounded-md" style={{ backgroundColor: "#FDEAEA", color: "#8A3535", border: "1px solid #B5696A" }}>
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <CitySearch
            city={city}
            country={country}
            required
            onSelect={(r) => { setCity(r.city); setCountry(r.country); }}
          />

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

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>How did you feel about it?</label>
            <VibeSelector value={vibe} onChange={setVibe} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Your notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What do you remember most?"
              rows={5}
              style={{ ...inputStyle(focused === "notes"), fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.125rem", lineHeight: 1.8, resize: "vertical", minHeight: "120px" }}
              onFocus={() => setFocused("notes")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Highlight</label>
            <input type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="The best part…" {...f("highlight")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Lowlight</label>
            <input type="text" value={lowlight} onChange={(e) => setLowlight(e.target.value)} placeholder="The one thing you'd change…" {...f("lowlight")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Would you return?</label>
            <div className="flex gap-2">
              {([true, false] as const).map((val) => (
                <button key={String(val)} type="button"
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

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Who did you go with?</label>
            <ChipSelector options={COMPANION_OPTIONS} value={travelStyle} onChange={setTravelStyle} />
          </div>

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
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <Link
              href={`/trips/${id}`}
              className="px-6 py-3 text-base font-medium"
              style={{ backgroundColor: "transparent", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", textDecoration: "none" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
