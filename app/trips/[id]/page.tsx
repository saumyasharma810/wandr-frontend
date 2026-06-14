"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TripPublic } from "../../lib/types";
import { getTrip, deleteTrip } from "../../lib/api";
import { getCityCoords } from "../../lib/geocode";
import { VIBE_CONFIG, MOCK_TRIPS } from "../../lib/mock-data";
import { useAuth } from "../../contexts/AuthContext";
import VibeChip from "../../components/VibeChip";
import ClientCountryMap from "../../components/ClientCountryMap";
import { useRouter } from "next/navigation";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
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

export default function TripDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [trip, setTrip] = useState<TripPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // Show mock trip for guest users; redirect auth page for unknown IDs
      const mock = MOCK_TRIPS.find((t) => t.id === String(params.id));
      if (mock) {
        setTrip({
          id: mock.id,
          city: mock.city,
          country: mock.country,
          vibe: mock.vibe,
          notes: mock.notes,
          travel_style: mock.travel_style,
          budget_level: mock.budget_level,
          start_date: mock.date,
          end_date: mock.date,
        } as unknown as TripPublic);
      } else {
        window.location.href = "/auth";
      }
      setLoading(false);
      return;
    }
    if (!id) return;
    getTrip(id)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, id, params.id]);

  async function handleDelete() {
    if (!trip || !confirm(`Delete trip to ${trip.city ?? trip.country}?`)) return;
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      router.replace("/trips");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (authLoading) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>
        Loading…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: "#B5696A" }}>{error || "Trip not found."}</p>
        <Link href="/trips" style={{ color: "#C4773B", textDecoration: "none" }}>← Back to trips</Link>
      </div>
    );
  }

  const vibe = trip.vibe ?? "neutral";
  const coords = trip.city ? getCityCoords(trip.city) : null;
  const tags = [
    trip.travel_style ? TRAVEL_STYLE_LABEL[trip.travel_style] : null,
    trip.budget_level ? BUDGET_LABEL[trip.budget_level] : null,
    trip.would_return === true ? "Would return" : trip.would_return === false ? "Wouldn't return" : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "#E8E2D9", maxWidth: "1200px", margin: "0 auto" }}>
        <nav className="flex items-center gap-2 text-sm" style={{ color: "#8C8279" }}>
          <Link href="/trips" style={{ color: "#8C8279", textDecoration: "none" }}>My Trips</Link>
          <span>/</span>
          <span style={{ color: "#2C2825" }}>{trip.city ?? trip.country}</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 56px - 49px)" }}>
        {/* Left — story */}
        <div className="flex-1 lg:w-[55%] px-6 py-10 lg:px-12 overflow-y-auto">
          <div style={{ maxWidth: "600px" }}>
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-1">
                <h1
                  className="text-4xl font-bold leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
                >
                  {trip.city ?? trip.country}
                </h1>
                {trip.city && (
                  <p className="text-lg mt-1" style={{ color: "#8C8279" }}>{trip.country}</p>
                )}
              </div>
              <VibeChip vibe={vibe} />
            </div>

            <p className="text-sm mb-8" style={{ color: "#8C8279" }}>
              {trip.start_date ? formatDate(trip.start_date) : ""}
              {trip.end_date && trip.end_date !== trip.start_date ? ` – ${formatDate(trip.end_date)}` : ""}
              {trip.duration_days ? ` · ${trip.duration_days} days` : ""}
            </p>

            {trip.notes && (
              <div
                className="mb-10 leading-loose"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.125rem",
                  lineHeight: 1.8,
                  color: "#2C2825",
                  whiteSpace: "pre-wrap",
                }}
              >
                {trip.notes}
              </div>
            )}

            {(trip.highlight || trip.lowlight) && (
              <div className="mb-10 flex flex-col gap-3">
                {trip.highlight && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium mt-0.5" style={{ color: "#9A6B00", minWidth: "72px" }}>Highlight</span>
                    <p className="text-sm leading-relaxed" style={{ color: "#2C2825" }}>{trip.highlight}</p>
                  </div>
                )}
                {trip.lowlight && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium mt-0.5" style={{ color: "#8A3535", minWidth: "72px" }}>Lowlight</span>
                    <p className="text-sm leading-relaxed" style={{ color: "#2C2825" }}>{trip.lowlight}</p>
                  </div>
                )}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs"
                    style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "9999px" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <Link
                href="/trips"
                className="px-4 py-2 text-sm font-medium"
                style={{ border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", textDecoration: "none" }}
              >
                ← All trips
              </Link>
              {isAuthenticated && (
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", textDecoration: "none" }}
                >
                  Edit trip
                </Link>
              )}
              {trip.city && (
                <Link
                  href={`/tips?city=${encodeURIComponent(trip.city)}`}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
                >
                  Tips for {trip.city}
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    border: "1px solid #B5696A",
                    borderRadius: "8px",
                    color: "#B5696A",
                    background: "transparent",
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? "Deleting…" : "Delete trip"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right — map or placeholder */}
        <div className="lg:w-[45%] h-64 lg:h-auto lg:sticky lg:top-14" style={{ minHeight: "300px" }}>
          <div className="w-full h-full p-4 lg:p-6" style={{ minHeight: "300px" }}>
            {coords ? (
              <ClientCountryMap
                city={trip.city ?? trip.country}
                lng={coords[0]}
                lat={coords[1]}
                vibe={vibe}
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center px-8"
                style={{ backgroundColor: "#EDE8E0", minHeight: "300px" }}
              >
                <p className="text-sm" style={{ color: "#8C8279" }}>
                  Map unavailable for {trip.city ?? trip.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
