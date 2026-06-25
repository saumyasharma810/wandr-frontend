// Derived-value helpers for the nested Trip/TripStop shape.
// See new_trip_format.md for the rules these encode.

import { VibeTag } from "./types";

// A minimal stop shape — accepts both real TripStopPublic and the mock
// stops used for guest-mode previews (which omit server-assigned fields
// like trip_id/created_at).
type MinimalStop = { city: string; vibe: VibeTag; notes?: string | null };

export function countriesLabel(trip: { countries: string[]; stops: Pick<MinimalStop, "city">[] }): string {
  const { countries, stops } = trip;
  if (countries.length === 0) return "";
  if (countries.length === 1) {
    const country = countries[0];
    return stops.length <= 1 ? `${stops[0]?.city ?? country}, ${country}` : `${country} · ${stops.length} cities`;
  }
  return countries.join(" → ");
}

// Mixed vibes don't average meaningfully — fall back to whichever vibe
// appears most often, with first stop's vibe as the tie-break (v1.1 polish
// item per new_trip_format.md; exact tie-breaking isn't specified further).
export function dominantVibe(trip: { stops: Pick<MinimalStop, "vibe">[] }): VibeTag {
  const counts = new Map<VibeTag, number>();
  for (const stop of trip.stops) {
    if (!stop.vibe) continue;
    counts.set(stop.vibe, (counts.get(stop.vibe) ?? 0) + 1);
  }
  if (counts.size === 0) return "neutral";
  let best: VibeTag = trip.stops[0]?.vibe ?? "neutral";
  let bestCount = 0;
  for (const [vibe, count] of counts) {
    if (count > bestCount) {
      best = vibe;
      bestCount = count;
    }
  }
  return best;
}

export function previewNotes(trip: { stops: Pick<MinimalStop, "notes">[] }): string | null {
  return trip.stops[0]?.notes ?? null;
}
