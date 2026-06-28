import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Fraunces, Inter } from "next/font/google";
import SiteHeader from "@/src/components/SiteHeader";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ComicMob",
  description: "Four worlds. One studio.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans text-paper antialiased">
        <SiteHeader />

        <main>{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
            <a href="/" className="font-display text-lg italic text-paper-soft">
              Comic<span className="text-foil">Mob</span>
            </a>
            <p className="text-xs uppercase tracking-widest2 text-paper-faint">
              Four worlds. One studio.
            </p>
            <p className="mt-4 text-xs text-paper-faint">
              © {new Date().getFullYear()} ComicMob
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
