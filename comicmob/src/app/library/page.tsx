import { createClient } from "@/src/lib/supabase/server";
import { getFavoriteStories } from "@/src/lib/stories-db";
import Cover from "@/src/components/Cover";
import Link from "next/link";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl italic text-paper">Sign in to see your library</p>
        <p className="mt-3 text-sm text-paper-soft">Saved stories are tied to your account.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-sm border border-line px-6 py-3 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
        >
          ← Back home, then use Sign In
        </Link>
      </div>
    );
  }

  const stories = await getFavoriteStories(data.user.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-10 font-display text-4xl italic text-paper">My Library</h1>

      {stories.length === 0 ? (
        <p className="text-sm text-paper-soft">
          Nothing saved yet — find a story you like and hit Save on its page.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <a
              key={story.id}
              href={`/story/${story.slug}`}
              className="group block"
              style={{ "--story-accent": story.accent } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-sm border border-line transition-colors group-hover:border-[var(--story-accent)]">
                <Cover
                  title={story.title}
                  accent={story.accent}
                  coverUrl={story.cover_url}
                  className="aspect-[2/3] w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-medium uppercase tracking-widest2" style={{ color: story.accent }}>
                  {story.genres.join(" · ")}
                </p>
                <p className="mt-1 font-display text-xl italic text-paper">{story.title}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
