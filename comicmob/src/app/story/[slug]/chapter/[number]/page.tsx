import { getStoryBySlug, getChapter, listStories } from "@/src/lib/stories";
import ChapterReader from "@/src/components/ChapterReader";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return listStories().flatMap((story) =>
    story.chapters.map((c) => ({ slug: story.slug, number: String(c.number) }))
  );
}

export default function ChapterPage({
  params,
}: {
  params: { slug: string; number: string };
}) {
  const story = getStoryBySlug(params.slug);
  if (!story) return notFound();

  const chapterNumber = parseInt(params.number, 10);
  const chapter = getChapter(story, chapterNumber);
  if (!chapter) return notFound();

  return (
    <ChapterReader
      storyTitle={story.title}
      storySlug={story.slug}
      accent={story.accent}
      chapterNumber={chapter.number}
      chapterTitle={chapter.title}
      paragraphs={chapter.paragraphs}
      totalChapters={story.chapters.length}
    />
  );
}
