"use client";
import { useState } from "react";
import LibraryLink from "@/src/components/LibraryLink";
import AuthStatus from "@/src/components/AuthStatus";

const navLinks = [
  { href: "/reader", label: "Reader" },
  { href: "/creator", label: "Creator" },
  { href: "/reviews", label: "Reviews" },
  { href: "/light-novels", label: "Light Novels" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="font-display text-2xl italic tracking-tight text-paper">
          Comic<span className="text-foil">Mob</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-xs font-medium uppercase tracking-widest2 text-paper-soft md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-paper">
              {link.label}
            </a>
          ))}
          <LibraryLink />
          <div className="h-4 w-px bg-line" />
          <AuthStatus />
        </nav>

        {/* Mobile: auth status + menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <AuthStatus />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="text-paper-soft hover:text-paper"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-line px-6 py-5 text-xs font-medium uppercase tracking-widest2 text-paper-soft md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="transition-colors hover:text-paper"
            >
              {link.label}
            </a>
          ))}
          <div onClick={() => setMenuOpen(false)}>
            <LibraryLink />
          </div>
        </nav>
      )}
    </header>
  );
}
