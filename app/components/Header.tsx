"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { href: "/trips", label: "My Trips" },
  { href: "/ask", label: "Ask Wandr" },
  { href: "/tips", label: "From the Road" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const logTripHref = isAuthenticated ? "/trips/new" : "/auth";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "56px",
        backgroundColor: "#FAF8F5",
        borderBottom: "1px solid #E8E2D9",
      }}
    >
      <Link
        href="/"
        className="text-xl font-bold tracking-tight"
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

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "0.875rem",
                fontWeight: active ? 500 : 400,
                color: active ? "#C4773B" : "#2C2825",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.target as HTMLElement).style.color = "#C4773B";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.target as HTMLElement).style.color = "#2C2825";
              }}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href={logTripHref}
          className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#C4773B",
            borderRadius: "8px",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            textDecoration: "none",
          }}
        >
          Log a trip
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1 p-2"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span
          className="block w-5 h-0.5 transition-all"
          style={{ backgroundColor: "#2C2825", transform: mobileOpen ? "rotate(45deg) translate(2px, 4px)" : "" }}
        />
        <span
          className="block w-5 h-0.5 transition-all"
          style={{ backgroundColor: "#2C2825", opacity: mobileOpen ? 0 : 1 }}
        />
        <span
          className="block w-5 h-0.5 transition-all"
          style={{ backgroundColor: "#2C2825", transform: mobileOpen ? "rotate(-45deg) translate(2px, -4px)" : "" }}
        />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col"
          style={{
            backgroundColor: "#FAF8F5",
            borderBottom: "1px solid #E8E2D9",
            boxShadow: "0 6px 20px rgba(44, 40, 37, 0.08)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 text-sm border-b"
              style={{
                color: pathname === link.href ? "#C4773B" : "#2C2825",
                borderColor: "#E8E2D9",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={logTripHref}
            onClick={() => setMobileOpen(false)}
            className="m-4 px-4 py-3 text-sm font-medium text-white text-center"
            style={{ backgroundColor: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
          >
            Log a trip
          </Link>
        </div>
      )}
    </header>
  );
}
