import { getStoryBySlug, getChapter, listChapterNumbers } from "@/src/lib/stories-db";
import ChapterReader from "@/src/components/ChapterReader";
import { notFound } from "next/navigation";

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; number: string };
}) {
  const story = await getStoryBySlug(params.slug);
  if (!story) return notFound();

  const chapterNumber = parseInt(params.number, 10);
  const chapter = await getChapter(story.id, chapterNumber);
  if (!chapter) return notFound();

  const allNumbers = await listChapterNumbers(story.id);

  return (
    <ChapterReader
      storyTitle={story.title}
      storySlug={story.slug}
      accent={story.accent}
      chapterNumber={chapter.number}
      chapterTitle={chapter.title}
      paragraphs={chapter.content.split("\n\n").filter(Boolean)}
      totalChapters={allNumbers.length}
    />
  );
}
