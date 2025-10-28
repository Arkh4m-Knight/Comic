import { listTrendingComics } from "@/src/lib/mock";

export default function ReaderIndexPage() {
  const comics = listTrendingComics();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reader</h1>
      <p className="text-neutral-300">Browse and jump into stories.</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {comics.map((c) => (
          <a key={c.id} href={`/reader/comic/${c.id}`} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
            <div className="aspect-[3/4] bg-neutral-800 group-hover:opacity-90" />
            <div className="p-3">
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-neutral-400">{c.genres.join(" · ")}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


