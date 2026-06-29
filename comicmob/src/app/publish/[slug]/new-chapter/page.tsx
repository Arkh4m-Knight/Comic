import { createClient } from "@/src/lib/supabase/server";
import { getStoryBySlug, listChapterNumbers, isAdmin } from "@/src/lib/stories-db";
import NewChapterForm from "@/src/components/NewChapterForm";
import { notFound, redirect } from "next/navigation";

export default async function NewChapterPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/publish");

  const story = await getStoryBySlug(params.slug);
  if (!story) return notFound();

  const isOwner = story.creator_id === data.user.id;
  const canWriteOriginal = story.is_original && (await isAdmin(data.user.id));
  if (!isOwner && !canWriteOriginal) redirect("/publish");

  const existingNumbers = await listChapterNumbers(story.id);
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2" style={{ color: story.accent }}>
        {story.title}
      </p>
      <h1 className="mb-10 font-display text-3xl italic text-paper">New Chapter</h1>
      <NewChapterForm storyId={story.id} storySlug={story.slug} nextNumber={nextNumber} />
    </div>
  );
}
