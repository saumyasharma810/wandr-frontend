"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { MOCK_TRIPS } from "./lib/mock-data";
import VibeChip from "./components/VibeChip";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/trips");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null;
  const preview = MOCK_TRIPS.slice(0, 3);

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36">
        <p
          className="text-sm uppercase tracking-widest mb-6"
          style={{
            color: "#C4773B",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            letterSpacing: "0.15em",
          }}
        >
          Your travel journal
        </p>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#2C2825",
            lineHeight: 1.15,
          }}
        >
          Every journey deserves to be remembered.
        </h1>
        <p
          className="mt-6 text-lg max-w-xl leading-relaxed"
          style={{ color: "#8C8279", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          Log your travels, discover honest tips from the road, and let Wandr
          help you plan what comes next.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/auth"
            className="px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#C4773B",
              borderRadius: "8px",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              textDecoration: "none",
            }}
          >
            Begin your journey
          </Link>
          <Link
            href="/trips"
            className="px-6 py-3 text-base font-medium transition-colors"
            style={{
              color: "#2C2825",
              border: "1px solid #E8E2D9",
              borderRadius: "8px",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              textDecoration: "none",
            }}
          >
            See the map
          </Link>
        </div>
      </section>

      {/* Mock trip preview */}
      <section className="px-6 pb-24" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "#8C8279", letterSpacing: "0.12em" }}
            >
              This could be your journey.
            </p>
            <h2
              className="text-2xl font-semibold"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#2C2825",
              }}
            >
              Sign in to start yours.
            </h2>
          </div>
          <Link
            href="/auth"
            className="text-sm hidden sm:block"
            style={{ color: "#C4773B", textDecoration: "none" }}
          >
            Sign in →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((trip) => (
            <Link
              key={trip.id}
              href="/auth"
              className="card-hover flex flex-col gap-3 p-6"
              style={{
                backgroundColor: "#F2EFE9",
                border: "1px solid #E8E2D9",
                borderRadius: "8px",
                boxShadow: "0 2px 12px rgba(44, 40, 37, 0.08)",
                opacity: 0.85,
                textDecoration: "none",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#2C2825",
                    }}
                  >
                    {trip.city}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "#8C8279" }}>
                    {trip.country}
                  </p>
                </div>
                <VibeChip vibe={trip.vibe} />
              </div>
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: "#2C2825" }}
              >
                {trip.notes}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 py-24 border-t" style={{ borderColor: "#E8E2D9" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {[
            {
              title: "Your map",
              body: "Every city you've visited, pinned and colour-coded by how you felt about it. Your story on a map.",
            },
            {
              title: "Ask Wandr",
              body: "A travel companion that knows your history. Ask where to go next and get answers grounded in your own trips.",
            },
            {
              title: "From the Road",
              body: "Honest tips from other travellers — no sponsored content, no influencer lists. Just notes from people who've been there.",
            },
          ].map((f) => (
            <div key={f.title}>
              <h3
                className="text-xl font-semibold mb-3"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#2C2825",
                }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8C8279" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
