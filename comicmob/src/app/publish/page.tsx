import { createClient } from "@/src/lib/supabase/server";
import { getMyStories, getStoryChapters } from "@/src/lib/stories-db";
import PublishDashboard from "@/src/components/PublishDashboard";
import Link from "next/link";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl italic text-paper">Sign in to publish</p>
        <p className="mt-3 text-sm text-paper-soft">
          You need an account to publish your own story on ComicMob.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-sm border border-line px-6 py-3 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
        >
          ← Back home, then use Sign In
        </Link>
      </div>
    );
  }

  const myStories = await getMyStories(data.user.id);
  const chaptersByStory: Record<string, { id: string; number: number; title: string }[]> = {};
  for (const story of myStories) {
    chaptersByStory[story.id] = await getStoryChapters(story.id);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 font-display text-4xl italic text-paper">Publish</h1>
      <PublishDashboard myStories={myStories} chaptersByStory={chaptersByStory} />
    </div>
  );
}
