"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPublic, TripPublic } from "../lib/types";
import { getMe, getTrips, authLogout } from "../lib/api";
import { VIBE_CONFIG } from "../lib/mock-data";
import { useRequireAuth } from "../contexts/AuthContext";
import VibeChip from "../components/VibeChip";
import { useRouter } from "next/navigation";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px" }}
    >
      <span className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#C4773B" }}>
        {value}
      </span>
      <span className="text-sm mt-1" style={{ color: "#8C8279" }}>{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const auth = useRequireAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [trips, setTrips] = useState<TripPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    Promise.all([getMe(), getTrips()])
      .then(([u, t]) => { setUser(u); setTrips(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auth]);

  async function handleLogout() {
    await authLogout();
    router.replace("/auth");
  }

  if (!auth || loading) {
    return <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>Loading…</div>;
  }

  const countries = new Set(trips.map((t) => t.country)).size;

  const vibeCounts = trips.reduce((acc, t) => {
    if (!t.vibe) return acc;
    return { ...acc, [t.vibe]: (acc[t.vibe] || 0) + 1 };
  }, {} as Record<string, number>);

  const topVibeEntry = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0];
  const topVibeLabel = topVibeEntry
    ? VIBE_CONFIG[topVibeEntry[0] as keyof typeof VIBE_CONFIG]?.label ?? topVibeEntry[0]
    : "—";

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <div className="px-6 py-10" style={{ maxWidth: "780px", margin: "0 auto" }}>
        {/* Profile header */}
        <div className="flex items-start gap-6 mb-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-semibold text-white"
            style={{ backgroundColor: "#C4773B", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              {user?.username}
            </h1>
            <p className="text-sm" style={{ color: "#8C8279" }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium"
            style={{ border: "1px solid #B5696A", borderRadius: "8px", color: "#B5696A", background: "transparent", cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Trips logged" value={trips.length} />
          <StatCard label="Countries" value={countries} />
          <StatCard label="Top vibe" value={topVibeLabel} />
        </div>

        {/* Vibe breakdown */}
        {trips.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              Vibe breakdown
            </h2>
            <div className="flex flex-col gap-3">
              {(["loved_it", "mixed", "neutral", "never_again"] as const).map((vibe) => {
                const count = vibeCounts[vibe] || 0;
                const pct = trips.length ? Math.round((count / trips.length) * 100) : 0;
                const cfg = VIBE_CONFIG[vibe];
                return (
                  <div key={vibe} className="flex items-center gap-4">
                    <div className="w-28 flex-shrink-0"><VibeChip vibe={vibe} /></div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E8E2D9" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cfg.dot }} />
                    </div>
                    <span className="text-sm w-8 text-right" style={{ color: "#8C8279" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent trips */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              Recent trips
            </h2>
            <Link href="/trips" style={{ color: "#C4773B", textDecoration: "none", fontSize: "0.875rem" }}>
              View all →
            </Link>
          </div>

          {trips.length === 0 ? (
            <p className="text-sm" style={{ color: "#8C8279" }}>
              No trips yet.{" "}
              <Link href="/trips/new" style={{ color: "#C4773B" }}>Log your first →</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {trips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors"
                  style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px", textDecoration: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F2EFE9"; }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
                      {trip.city ?? trip.country}
                    </span>
                    {trip.city && <span className="text-sm" style={{ color: "#8C8279" }}>{trip.country}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {trip.vibe && <VibeChip vibe={trip.vibe} />}
                    {trip.start_date && (
                      <span className="text-xs" style={{ color: "#8C8279" }}>
                        {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <div className="p-6 rounded-lg border" style={{ borderColor: "#E8E2D9", backgroundColor: "#F2EFE9" }}>
          <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
            Account
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "#8C8279" }}>Username</span>
              <span style={{ color: "#2C2825" }}>{user?.username}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "#8C8279" }}>Email</span>
              <span style={{ color: "#2C2825" }}>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
