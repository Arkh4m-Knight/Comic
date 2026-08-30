import { getStoryBySlug, getChapter, getStoryChapters, listChapterNumbers, getMyCoinBalance, splitParagraphs, getReadingProgress } from "@/src/lib/stories-db";
import ChapterReader from "@/src/components/ChapterReader";
import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME, clampDescription } from "@/src/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; number: string };
}): Promise<Metadata> {
  const chapterNumber = parseInt(params.number, 10);
  const story = Number.isNaN(chapterNumber) ? null : await getStoryBySlug(params.slug);

  if (!story) {
    return { title: "Chapter not found | ComicMob", robots: { index: false, follow: true } };
  }

  // Deliberately read the chapter list rather than getChapter(): the latter
  // goes through get_chapter_access, which evaluates paywall/Daily Pass state.
  // Metadata generation shouldn't be touching unlock logic — it only needs a
  // title.
  const chapters = await getStoryChapters(story.id);
  const chapter = chapters.find((c) => c.number === chapterNumber);

  if (!chapter) {
    return { title: `${story.title} | ComicMob`, robots: { index: false, follow: true } };
  }

  const chapterTitle = chapter.title?.trim();
  const label = chapterTitle
    ? `Chapter ${chapterNumber}: ${chapterTitle}`
    : `Chapter ${chapterNumber}`;
  const title = `${story.title} — ${label} | Read Free on ComicMob`;
  const description = clampDescription(
    `Read ${label} of ${story.title}, an original ${story.genres.join("/")} web novel on ComicMob. ${story.hook}`,
  );

  const path = `/story/${story.slug}/chapter/${chapterNumber}`;
  const images = story.cover_url
    ? [{ url: story.cover_url, alt: `${story.title} cover art` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: story.cover_url ? [story.cover_url] : undefined,
    },
  };
}

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
  const coinBalance = await getMyCoinBalance();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const progress = userData.user ? await getReadingProgress(userData.user.id, story.id) : null;
  // Only resume-scroll when this page IS the chapter they bookmarked --
  // opening a different chapter always starts at the top.
  const resumeParagraphIndex = progress && progress.chapter_number === chapterNumber ? progress.paragraph_index : null;

  return (
    <ChapterReader
      storyId={story.id}
      storyTitle={story.title}
      storySlug={story.slug}
      genre={story.genres.join(", ")}
      accent={story.accent}
      chapterId={chapter.id}
      chapterNumber={chapter.number}
      chapterTitle={chapter.title}
      paragraphs={chapter.content ? splitParagraphs(chapter.content) : []}
      totalChapters={allNumbers.length}
      locked={chapter.locked}
      freeAt={chapter.free_at}
      coinPrice={chapter.coin_price}
      coinBalance={coinBalance}
      resumeParagraphIndex={resumeParagraphIndex}
    />
  );
}
