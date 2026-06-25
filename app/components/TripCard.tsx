"use client";

import Link from "next/link";
import { TripPublic } from "../lib/types";
import { VIBE_CONFIG } from "../lib/mock-data";
import { countriesLabel, dominantVibe, previewNotes } from "../lib/trip-helpers";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const TRAVEL_STYLE_LABEL: Record<string, string> = {
  solo: "Solo",
  couple: "Couple",
  group: "Group",
  family: "Family",
};

const BUDGET_LABEL: Record<string, string> = {
  backpacker: "Budget",
  mid: "Mid-range",
  luxury: "Luxury",
};

export default function TripCard({ trip }: { trip: TripPublic }) {
  const vibe = dominantVibe(trip);
  const cfg = VIBE_CONFIG[vibe];
  const notes = previewNotes(trip);
  const location = countriesLabel(trip);

  return (
    <Link href={`/trips/${trip.id}`} className="block" style={{ textDecoration: "none" }}>
      <article
        className="flex flex-col gap-3 p-6 h-full transition-all duration-150"
        style={{
          backgroundColor: "#F2EFE9",
          border: "1px solid #E8E2D9",
          borderRadius: "8px",
          boxShadow: "0 2px 12px rgba(44, 40, 37, 0.08)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 6px 20px rgba(44, 40, 37, 0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 2px 12px rgba(44, 40, 37, 0.08)";
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              {trip.title ?? location}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "#8C8279" }}>
              {trip.title ? location : null}
              {trip.start_date ? ` · ${formatDate(trip.start_date)}` : ""}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: cfg.bg,
              color: cfg.text,
              borderRadius: "9999px",
              whiteSpace: "nowrap",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>

        {notes && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: "#2C2825" }}
          >
            {notes}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1">
          {trip.travel_style && (
            <span className="text-xs" style={{ color: "#8C8279" }}>
              {TRAVEL_STYLE_LABEL[trip.travel_style] ?? trip.travel_style}
            </span>
          )}
          {trip.budget_level && (
            <span className="text-xs" style={{ color: "#8C8279" }}>
              · {BUDGET_LABEL[trip.budget_level] ?? trip.budget_level}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
