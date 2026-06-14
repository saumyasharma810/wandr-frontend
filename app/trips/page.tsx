"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TripPublic } from "../lib/types";
import { getTrips } from "../lib/api";
import { getCityCoords } from "../lib/geocode";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../components/TripCard";
import ClientWorldMap from "../components/ClientWorldMap";
import { MapPin } from "../components/WorldMap";
import { MOCK_TRIPS, VIBE_CONFIG } from "../lib/mock-data";

const MOCK_PINS: MapPin[] = MOCK_TRIPS.map((t) => ({
  id: t.id,
  city: t.city,
  country: t.country,
  lng: t.lng,
  lat: t.lat,
  vibe: t.vibe,
}));

export default function MyTripsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [trips, setTrips] = useState<TripPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    getTrips()
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Resolve pins — static lookup first, Mapbox geocoding for unknowns
  useEffect(() => {
    if (!trips.length) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    async function resolve() {
      const resolved = await Promise.all(
        trips.map(async (t) => {
          if (!t.city || !t.vibe) return null;
          const static_coords = getCityCoords(t.city);
          if (static_coords) return { id: t.id, city: t.city, country: t.country, lng: static_coords[0], lat: static_coords[1], vibe: t.vibe } as MapPin;
          if (!token) return null;
          try {
            const r = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(t.city)}.json?types=place&limit=1&access_token=${token}`);
            const data = await r.json();
            const f = data.features?.[0];
            if (!f) return null;
            return { id: t.id, city: t.city, country: t.country, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], vibe: t.vibe } as MapPin;
          } catch { return null; }
        })
      );
      setPins(resolved.filter(Boolean) as MapPin[]);
    }
    resolve();
  }, [trips]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>
        Loading…
      </div>
    );
  }

  // ── GUEST MODE ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
        {/* Map hero — no overlay, pins visible */}
        <div className="relative" style={{ height: "45vh" }}>
          <ClientWorldMap pins={MOCK_PINS} initialZoom={2.5} initialCenter={[45, 25]} />
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #FAF8F5)" }}
          />
        </div>

        {/* Mock cards */}
        <div className="px-6 pb-16" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="flex items-center justify-between py-8">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
              >
                My Trips
              </h1>
              <p className="text-sm mt-1" style={{ color: "#8C8279" }}>
                A preview — sign in to see your own journal
              </p>
            </div>
            <Link
              href="/auth"
              className="px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
            >
              Log a trip
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TRIPS.map((trip) => {
              const cfg = VIBE_CONFIG[trip.vibe];
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <article
                    className="flex flex-col gap-3 p-6 h-full transition-all duration-150"
                    style={{
                      backgroundColor: "#F2EFE9",
                      border: "1px solid #E8E2D9",
                      borderRadius: "8px",
                      boxShadow: "0 2px 12px rgba(44, 40, 37, 0.08)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(44, 40, 37, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(44, 40, 37, 0.08)";
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className="text-lg font-semibold leading-tight"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
                        >
                          {trip.city}
                        </h3>
                        <p className="text-sm mt-0.5" style={{ color: "#8C8279" }}>{trip.country}</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: cfg.bg, color: cfg.text, borderRadius: "9999px" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#2C2825" }}>
                      {trip.notes}
                    </p>
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      <span className="text-xs" style={{ color: "#8C8279" }}>{trip.companions}</span>
                      <span className="text-xs" style={{ color: "#8C8279" }}>
                        ·{" "}
                        {new Date(trip.date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p
              className="text-base font-medium mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              Every journey deserves to be remembered.
            </p>
            <p className="text-sm mb-6" style={{ color: "#8C8279" }}>
              Start your own journal — it takes 30 seconds.
            </p>
            <Link
              href="/auth"
              className="inline-block px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
            >
              Begin your journey
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED MODE ────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Map hero */}
      <div className="relative" style={{ height: "calc(45vh + 10px)", overflow: "hidden" }}>
        <div style={{ height: "45vh" }}>
          <ClientWorldMap pins={pins} />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #FAF8F5)" }}
        />
      </div>

      {/* Trip cards */}
      <div className="px-6 pb-16" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="flex items-center justify-between py-8">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              My Trips
            </h1>
            {!loading && (
              <p className="text-sm mt-1" style={{ color: "#8C8279" }}>
                {trips.length} {trips.length === 1 ? "place" : "places"} visited
              </p>
            )}
          </div>
          <Link
            href="/trips/new"
            className="px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
          >
            Log a trip
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <p style={{ color: "#8C8279" }}>Loading your trips…</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p style={{ color: "#B5696A" }}>{error}</p>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2
              className="text-2xl font-semibold mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
            >
              Your map is waiting.
            </h2>
            <p className="text-base mb-8" style={{ color: "#8C8279" }}>
              Every journey starts somewhere — where was yours?
            </p>
            <Link
              href="/trips/new"
              className="px-6 py-3 text-base font-medium text-white"
              style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
            >
              Log your first trip
            </Link>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
