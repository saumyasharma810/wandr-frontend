"use client";

import { useState, useEffect, useRef } from "react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface CityResult {
  city: string;
  country: string;
  lat: number;
  lng: number;
  fullName: string;
}

interface SearchResult extends CityResult {
  region: string; // state/province — shown in dropdown only
}

interface Props {
  city: string;
  country: string;
  onSelect: (result: CityResult) => void;
  required?: boolean;
}

export default function CitySearch({ city, country, onSelect, required }: Props) {
  const [query, setQuery] = useState(city || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync if parent resets the value
  useEffect(() => {
    if (!city) setQuery("");
  }, [city]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place&limit=6&access_token=${TOKEN}`
        );
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: SearchResult[] = (data.features ?? []).map((f: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ctx: any[] = f.context ?? [];
          const countryCtx = ctx.find((c) => c.id.startsWith("country."));
          const regionCtx = ctx.find((c) => c.id.startsWith("region."));
          return {
            city: f.text,
            country: countryCtx?.text ?? "",
            region: regionCtx?.text ?? "",
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            fullName: f.place_name,
          };
        });
        setResults(mapped);
        setOpen(mapped.length > 0);
      } catch {
        // silently fail — user can still type manually
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(r: CityResult) {
    setQuery(r.city);
    setOpen(false);
    onSelect(r);
  }

  const inputStyle: React.CSSProperties = {
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

  return (
    <div className="flex gap-4">
      {/* City search */}
      <div className="flex-1" ref={containerRef} style={{ position: "relative" }}>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>
          City {required && <span style={{ color: "#C4773B" }}>*</span>}
        </label>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search city…"
          required={required}
          autoComplete="off"
          style={inputStyle}
        />
        {loading && (
          <span style={{ position: "absolute", right: 12, top: "calc(50% + 10px)", transform: "translateY(-50%)", color: "#8C8279", fontSize: "0.75rem" }}>
            …
          </span>
        )}

        {open && results.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E2D9",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(44,40,37,0.12)",
              zIndex: 50,
              padding: "4px 0",
              margin: 0,
              listStyle: "none",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {results.map((r) => (
              <li
                key={r.fullName}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                style={{ padding: "0" }}
              >
                <button
                  type="button"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "9px 14px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = "#F2EFE9"; }}
                  onMouseLeave={(e) => { (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "0.9375rem", color: "#2C2825", fontWeight: 500 }}>{r.city}</span>
                  <span style={{ fontSize: "0.8125rem", color: "#8C8279" }}>
                    {[r.region, r.country].filter(Boolean).join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Country — auto-filled, read-only once selected, editable */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Country</label>
        <input
          type="text"
          value={country}
          onChange={(e) => onSelect({ city: query, country: e.target.value, lat: 0, lng: 0, fullName: "" })}
          placeholder="Auto-filled"
          style={{
            ...inputStyle,
            boxShadow: "none",
            border: "1px solid #E8E2D9",
            color: country ? "#2C2825" : "#8C8279",
          }}
        />
      </div>
    </div>
  );
}
