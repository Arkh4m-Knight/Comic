"use client";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.includes("/chapter/")) return null;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
        <a href="/" className="font-display text-lg italic text-paper-soft">
          Comic<span className="text-foil">Mob</span>
        </a>
        <p className="text-xs uppercase tracking-widest2 text-paper-faint">
          Four worlds. One studio.
        </p>
        <p className="mt-4 text-xs text-paper-faint">© {new Date().getFullYear()} ComicMob</p>
      </div>
    </footer>
  );
}
