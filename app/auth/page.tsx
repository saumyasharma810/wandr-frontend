"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

function inputStyle(focused: boolean) {
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

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/trips");
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      router.replace("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function field(name: string) {
    return {
      style: inputStyle(focused === name),
      onFocus: () => setFocused(name),
      onBlur: () => setFocused(null),
    };
  }

  return (
    <div className="flex min-h-screen" style={{ marginTop: "-56px", paddingTop: "56px" }}>
      {/* Left — editorial landscape panel */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-end p-12 overflow-hidden"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {/* Full-bleed landscape illustration */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="auth-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#110A04" />
              <stop offset="35%" stopColor="#2A1509" />
              <stop offset="65%" stopColor="#5E2F12" />
              <stop offset="85%" stopColor="#8C4520" />
              <stop offset="100%" stopColor="#A8551E" />
            </linearGradient>
            <radialGradient id="auth-glow" cx="68%" cy="58%" r="35%">
              <stop offset="0%" stopColor="#C4773B" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#C4773B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C4773B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky */}
          <rect width="600" height="900" fill="url(#auth-sky)" />
          {/* Horizon glow */}
          <rect width="600" height="900" fill="url(#auth-glow)" />

          {/* Stars */}
          <circle cx="48" cy="38" r="1" fill="rgba(250,248,245,0.55)" />
          <circle cx="120" cy="72" r="0.8" fill="rgba(250,248,245,0.4)" />
          <circle cx="195" cy="28" r="1.2" fill="rgba(250,248,245,0.6)" />
          <circle cx="260" cy="55" r="0.7" fill="rgba(250,248,245,0.35)" />
          <circle cx="85" cy="155" r="0.9" fill="rgba(250,248,245,0.45)" />
          <circle cx="340" cy="42" r="1" fill="rgba(250,248,245,0.5)" />
          <circle cx="430" cy="88" r="0.8" fill="rgba(250,248,245,0.4)" />
          <circle cx="500" cy="30" r="1.1" fill="rgba(250,248,245,0.55)" />
          <circle cx="558" cy="110" r="0.7" fill="rgba(250,248,245,0.35)" />
          <circle cx="155" cy="190" r="0.8" fill="rgba(250,248,245,0.3)" />
          <circle cx="390" cy="160" r="0.9" fill="rgba(250,248,245,0.4)" />
          <circle cx="70" cy="210" r="0.7" fill="rgba(250,248,245,0.3)" />

          {/* Moon */}
          <circle cx="460" cy="180" r="28" fill="#E8AA5A" opacity="0.18" />
          <circle cx="460" cy="180" r="18" fill="#F0C070" opacity="0.3" />
          <circle cx="460" cy="180" r="10" fill="#FFD898" opacity="0.5" />

          {/* Far mountain range */}
          <path
            d="M0 560 L55 445 L110 490 L165 415 L220 470 L275 390 L330 445 L385 375 L440 425 L495 365 L545 400 L600 380 L600 900 L0 900Z"
            fill="#1E0E06"
            opacity="0.75"
          />

          {/* Mid mountain range */}
          <path
            d="M0 640 L70 530 L140 575 L210 500 L275 548 L340 488 L400 535 L460 498 L520 528 L580 505 L600 515 L600 900 L0 900Z"
            fill="#170A04"
            opacity="0.88"
          />

          {/* Foreground ridge */}
          <path
            d="M0 740 Q80 715 180 730 Q280 748 380 722 Q480 700 600 728 L600 900 L0 900Z"
            fill="#0E0602"
          />

          {/* Path / trail on ground */}
          <path
            d="M200 900 Q250 820 270 760 Q285 730 290 710"
            stroke="rgba(196,119,59,0.2)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Lone figure — walking, viewed from behind, backpack visible */}
          <g transform="translate(278, 668)">
            {/* Head */}
            <circle cx="12" cy="0" r="7.5" fill="#0C0502" />
            {/* Backpack */}
            <rect x="4" y="7" width="16" height="20" rx="3.5" fill="#100704" />
            {/* Backpack strap lines */}
            <line x1="7" y1="7" x2="5" y2="20" stroke="#0C0502" strokeWidth="1.5" />
            <line x1="17" y1="7" x2="19" y2="20" stroke="#0C0502" strokeWidth="1.5" />
            {/* Body behind backpack */}
            <path d="M5 7 Q12 5 19 7 L21 27 L3 27Z" fill="#0A0401" />
            {/* Left leg — slightly forward (mid-stride) */}
            <line x1="7" y1="27" x2="3" y2="46" stroke="#0A0401" strokeWidth="4.5" strokeLinecap="round" />
            {/* Right leg — slightly back */}
            <line x1="17" y1="27" x2="22" y2="44" stroke="#0A0401" strokeWidth="4.5" strokeLinecap="round" />
            {/* Left arm — swinging forward */}
            <line x1="5" y1="10" x2="-3" y2="24" stroke="#0A0401" strokeWidth="3" strokeLinecap="round" />
            {/* Right arm — swinging back */}
            <line x1="19" y1="10" x2="27" y2="23" stroke="#0A0401" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote
            className="text-3xl leading-snug mb-4 italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "rgba(250,248,245,0.95)" }}
          >
            &ldquo;Not all those who wander are lost.&rdquo;
          </blockquote>
          <p className="text-sm" style={{ color: "rgba(250,248,245,0.55)" }}>— J.R.R. Tolkien</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="w-full max-w-sm mx-auto">
          <Link
            href="/"
            className="block text-2xl font-bold mb-10"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#2C2825",
              textDecoration: "none",
            }}
          >
            Wandr
          </Link>

          <h1
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
          >
            {mode === "login" ? "Welcome back." : "Start your journal."}
          </h1>
          <p className="text-sm mb-8" style={{ color: "#8C8279" }}>
            {mode === "login" ? "Sign in to continue your journey." : "Every journey starts somewhere."}
          </p>

          {error && (
            <div
              className="px-4 py-3 text-sm mb-4 rounded-md"
              style={{ backgroundColor: "#FDEAEA", color: "#8A3535", border: "1px solid #B5696A" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                autoComplete="username"
                {...field("username")}
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  {...field("email")}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                {...field("password")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-medium text-white mt-2 transition-opacity"
              style={{
                backgroundColor: "#C4773B",
                borderRadius: "8px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}
            >
              {loading ? "Please wait…" : mode === "login" ? "Begin wandering" : "Begin your journey"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "#8C8279" }}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  style={{ color: "#C4773B", background: "none", border: "none", cursor: "pointer" }}
                >
                  Begin your journey
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  style={{ color: "#C4773B", background: "none", border: "none", cursor: "pointer" }}
                >
                  Begin wandering
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
