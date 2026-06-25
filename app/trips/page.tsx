"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TripPublic } from "../lib/types";
import { getTrips } from "../lib/api";
import { resolveCityCoords } from "../lib/geocode";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../components/TripCard";
import ClientWorldMap from "../components/ClientWorldMap";
import { MapPin } from "../components/WorldMap";
import { MOCK_TRIPS } from "../lib/mock-data";

const MOCK_PINS: MapPin[] = MOCK_TRIPS.flatMap((t) =>
  t.stops.map((s) => ({
    id: s.id,
    tripId: t.id,
    city: s.city,
    country: s.country,
    lng: s.lng,
    lat: s.lat,
    vibe: s.vibe ?? "neutral",
  }))
);

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

  // Resolve pins per stop — static lookup first, Mapbox geocoding for unknowns
  useEffect(() => {
    if (!trips.length) return;
    async function resolve() {
      const resolved = await Promise.all(
        trips.flatMap((trip) =>
          trip.stops.map(async (stop) => {
            const coords = await resolveCityCoords(stop.city);
            if (!coords) return null;
            return {
              id: stop.id,
              tripId: trip.id,
              city: stop.city,
              country: stop.country,
              lng: coords[0],
              lat: coords[1],
              vibe: stop.vibe ?? "neutral",
            } as MapPin;
          })
        )
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
            {MOCK_TRIPS.map((trip) => (
              <TripCard key={trip.id} trip={trip as unknown as TripPublic} />
            ))}
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
