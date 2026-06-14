import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wandr — Your travel journal",
  description: "Log your travels, discover tips from the road, and plan your next adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <AuthProvider>
          <Header />
          <main className="flex-1 pt-14">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
