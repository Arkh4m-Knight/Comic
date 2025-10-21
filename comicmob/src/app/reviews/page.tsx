import ReviewWidget from "@/src/components/ReviewWidget";
import { listTrendingComics, listReviews } from "@/src/lib/mock";

export default function ReviewsPage() {
  const comics = listTrendingComics();
  const comic = comics[0];
  const reviews = comic ? listReviews(comic.id) : [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      {comic && (
        <div className="space-y-3 rounded-xl border border-neutral-800 p-4">
          <h2 className="font-semibold">{comic.title}</h2>
          <ReviewWidget comicId={comic.id} />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-xl border border-neutral-800 p-4">
            <h2 className="font-semibold">{r.type} Review</h2>
            <p className="text-sm text-neutral-400">Rating: {r.rating}/5</p>
            <p className="mt-2 text-neutral-200">{r.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}


