"use client";

import Link from "next/link";

export default function SignInModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(44, 40, 37, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-8 text-center"
        style={{
          backgroundColor: "#FAF8F5",
          borderRadius: "12px",
          boxShadow: "0 8px 40px rgba(44, 40, 37, 0.25)",
          animation: "wandr-modal-in 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{
            color: "#8C8279",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            lineHeight: 1,
            padding: "4px 8px",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "#F0E6D8" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="#C4773B" opacity="0.85" />
            <path
              d="M4 20c0-4 3.6-6 8-6s8 2 8 6"
              stroke="#C4773B"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          </svg>
        </div>

        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}
        >
          Your journal is waiting.
        </h2>
        <p className="text-sm mb-6" style={{ color: "#8C8279", lineHeight: 1.65 }}>
          Sign in to log your trips, leave notes from the road, and ask Wandr
          what&apos;s next.
        </p>

        <Link
          href="/auth"
          className="block w-full py-3 text-base font-medium text-white mb-3 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
        >
          Begin your journey
        </Link>
        <button
          onClick={onClose}
          className="text-sm"
          style={{ color: "#8C8279", background: "none", border: "none", cursor: "pointer" }}
        >
          Maybe later
        </button>
      </div>

      <style>{`
        @keyframes wandr-modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
