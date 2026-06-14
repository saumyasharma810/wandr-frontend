"use client";

import { useState, useEffect, useCallback } from "react";
import { StrangerTipPublic } from "../lib/types";
import { getTips, createTip, upvoteTip } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import CitySearch from "../components/CitySearch";

function TipCard({
  tip,
  onUpvote,
  isAuthenticated,
}: {
  tip: StrangerTipPublic;
  onUpvote: (id: number) => void;
  isAuthenticated: boolean;
}) {
  const [voted, setVoted] = useState(false);

  function handleVote() {
    if (!isAuthenticated || voted) return;
    setVoted(true);
    onUpvote(tip.id);
  }

  return (
    <article
      className="flex flex-col gap-3 p-6"
      style={{
        backgroundColor: "#F2EFE9",
        border: "1px solid #E8E2D9",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(44, 40, 37, 0.08)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: "#8C8279" }}>
          {tip.city}, {tip.country}
        </span>
      </div>

      <p className="text-base leading-relaxed" style={{ color: "#2C2825", lineHeight: 1.7 }}>
        {tip.content}
      </p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {tip.username ? (
            <span className="text-sm font-medium" style={{ color: "#2C2825" }}>{tip.username}</span>
          ) : (
            <span className="text-sm flex items-center gap-1" style={{ color: "#8C8279" }}>
              <span>☁</span> Anonymous
            </span>
          )}
          <span className="text-xs" style={{ color: "#8C8279" }}>
            ·{" "}
            {new Date(tip.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>

        <button
          onClick={handleVote}
          disabled={!isAuthenticated || voted}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{
            color: voted ? "#C4773B" : "#8C8279",
            background: "none",
            border: "none",
            cursor: isAuthenticated && !voted ? "pointer" : "default",
          }}
          title={!isAuthenticated ? "Sign in to mark as helpful" : ""}
        >
          <span>{voted ? "♥" : "♡"}</span>
          <span>{tip.helpful_count + (voted ? 1 : 0)} helpful</span>
        </button>
      </div>
    </article>
  );
}

function ComposeCard({
  onSubmit,
  isAuthenticated,
}: {
  onSubmit: (data: { city: string; country: string; content: string; is_anonymous: boolean }) => Promise<void>;
  isAuthenticated: boolean;
}) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function fieldStyle(name: string): React.CSSProperties {
    return {
      backgroundColor: "#FFFFFF",
      border: `1px solid ${focused === name ? "#C4773B" : "#E8E2D9"}`,
      borderRadius: "4px",
      color: "#2C2825",
      fontSize: "0.9375rem",
      outline: "none",
      boxShadow: focused === name ? "0 0 0 3px #F0E6D8" : "none",
      padding: "8px 12px",
      width: "100%",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city || !content || !isAuthenticated) return;
    setSubmitting(true);
    try {
      await onSubmit({ city, country, content, is_anonymous: anonymous });
      setCity(""); setCountry(""); setContent(""); setAnonymous(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 mb-6"
      style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px", boxShadow: "0 2px 12px rgba(44, 40, 37, 0.08)" }}
    >
      <h3 className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
        Leave a note from the road
      </h3>

      {!isAuthenticated && (
        <p className="text-sm" style={{ color: "#8C8279" }}>
          <a href="/auth" style={{ color: "#C4773B" }}>Sign in</a> to share a tip.
        </p>
      )}

      {isAuthenticated ? (
        <CitySearch
          city={city}
          country={country}
          required
          onSelect={(r) => { setCity(r.city); setCountry(r.country); }}
        />
      ) : (
        <div className="flex gap-3">
          <input type="text" placeholder="City" value={city} disabled style={fieldStyle("city")} />
          <input type="text" placeholder="Country" value={country} disabled style={fieldStyle("country")} />
        </div>
      )}

      <textarea
        placeholder="What do you wish you'd known before arriving?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        disabled={!isAuthenticated}
        rows={3}
        style={{ ...fieldStyle("content"), resize: "vertical", minHeight: "80px", lineHeight: 1.6 }}
        onFocus={() => setFocused("content")}
        onBlur={() => setFocused(null)}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#8C8279" }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={!isAuthenticated}
            style={{ accentColor: "#C4773B" }}
          />
          Post anonymously
        </label>
        <button
          type="submit"
          disabled={!isAuthenticated || submitting || !city || !content}
          className="ml-auto px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#C4773B",
            borderRadius: "8px",
            border: "none",
            cursor: isAuthenticated && !submitting ? "pointer" : "not-allowed",
            opacity: isAuthenticated && !submitting ? 1 : 0.5,
          }}
        >
          {submitting ? "Posting…" : "Add a tip"}
        </button>
      </div>
    </form>
  );
}

export default function TipsPage() {
  const { isAuthenticated } = useAuth();
  const [tips, setTips] = useState<StrangerTipPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityFilter, setCityFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("city") ?? "";
    }
    return "";
  });
  const [countryFilter, setCountryFilter] = useState("");

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTips({
        city: cityFilter || undefined,
        country: countryFilter || undefined,
        limit: 50,
      });
      setTips(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tips");
    } finally {
      setLoading(false);
    }
  }, [cityFilter, countryFilter]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  async function handleAddTip(data: { city: string; country: string; content: string; is_anonymous: boolean }) {
    const newTip = await createTip({ ...data, is_public: true });
    setTips((prev) => [newTip, ...prev]);
  }

  async function handleUpvote(id: number) {
    try {
      const updated = await upvoteTip(id);
      setTips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      // upvote failed silently
    }
  }

  // Derive unique cities from loaded tips for filter dropdown
  const cities = Array.from(new Set(tips.map((t) => t.city))).sort();

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <div className="px-6 py-10" style={{ maxWidth: "780px", margin: "0 auto" }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
            From the Road
          </h1>
          <p className="text-sm" style={{ color: "#8C8279" }}>
            Honest notes left by travellers. No sponsorship, no lists — just the real thing.
          </p>
        </div>

        <ComposeCard onSubmit={handleAddTip} isAuthenticated={isAuthenticated} />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-sm px-3 py-2"
            style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", cursor: "pointer", outline: "none" }}
          >
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="Filter by country"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-sm px-3 py-2"
            style={{ backgroundColor: "#F2EFE9", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", outline: "none", width: "160px" }}
          />
          {(cityFilter || countryFilter) && (
            <button
              onClick={() => { setCityFilter(""); setCountryFilter(""); }}
              className="text-sm"
              style={{ color: "#C4773B", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="py-16 text-center" style={{ color: "#8C8279" }}>Loading tips…</div>
        )}

        {error && (
          <div className="py-8 text-center" style={{ color: "#B5696A" }}>{error}</div>
        )}

        {!loading && !error && tips.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl font-medium mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
              Be the first to leave a note from the road.
            </p>
            <p className="text-sm" style={{ color: "#8C8279" }}>No tips yet for this filter — you could change that.</p>
          </div>
        )}

        {!loading && !error && tips.length > 0 && (
          <div className="flex flex-col gap-4">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} onUpvote={handleUpvote} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
