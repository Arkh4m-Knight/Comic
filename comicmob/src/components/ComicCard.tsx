import { Comic } from "@/src/types";

export default function ComicCard({ comic }: { comic: Comic }) {
  return (
    <a
      href={`/reader/comic/${comic.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-sm border border-line bg-ink-900 transition-colors duration-300 group-hover:border-foil">
        {comic.coverUrl ? (
          <img
            src={comic.coverUrl}
            alt={comic.title}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[3/4] bg-ink-800" />
        )}
      </div>
      <div className="pt-3">
        <p className="text-[10px] font-medium uppercase tracking-widest2 text-foil/80">
          {comic.format}
        </p>
        <p className="mt-1 font-display text-base text-paper">{comic.title}</p>
        <p className="text-xs text-paper-soft">{comic.genres.join(" · ")}</p>
      </div>
    </a>
  );
}
