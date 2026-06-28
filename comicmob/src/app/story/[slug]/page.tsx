import { getStoryBySlug, listStories } from "@/src/lib/stories";
import StoryCover from "@/src/components/StoryCover";
import { FormatStatus } from "@/src/types";
import Link from "next/link";

export function generateStaticParams() {
  return listStories().map((s) => ({ slug: s.slug }));
}

const statusLabel: Record<FormatStatus, string> = {
  available: "Available Now",
  "in-development": "In Development",
  planned: "Planned",
};

function RoadmapStep({
  label,
  status,
  accent,
}: {
  label: string;
  status: FormatStatus;
  accent: string;
}) {
  const isAvailable = status === "available";
  return (
    <div className="flex items-center gap-4 border-b border-line py-5 last:border-b-0">
      <div
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: isAvailable ? accent : "#3A3A3F" }}
      />
      <div className="flex-1">
        <p className="font-display text-lg italic text-paper">{label}</p>
      </div>
      <span
        className="text-[10px] font-medium uppercase tracking-widest2"
        style={{ color: isAvailable ? accent : undefined }}
      >
        <span className={isAvailable ? "" : "text-paper-faint"}>{statusLabel[status]}</span>
      </span>
    </div>
  );
}

export default function StoryHubPage({ params }: { params: { slug: string } }) {
  const story = getStoryBySlug(params.slug);

  if (!story) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-paper-soft">
        Story not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-block text-xs uppercase tracking-widest2 text-paper-soft hover:text-paper"
      >
        ← All Stories
      </Link>

      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <div
          className="overflow-hidden rounded-sm border"
          style={{ borderColor: story.accent + "80" }}
        >
          <StoryCover title={story.title} accent={story.accent} className="aspect-[2/3] w-full" />
        </div>

        <div>
          <p
            className="mb-3 text-[11px] font-medium uppercase tracking-widest2"
            style={{ color: story.accent }}
          >
            {story.genres.join(" · ")}
          </p>
          <h1 className="font-display text-4xl italic leading-tight text-paper sm:text-5xl">
            {story.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper-soft">{story.hook}</p>

          <div className="mt-12">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
              The Roadmap
            </p>
            <div className="rounded-sm border border-line px-2">
              <RoadmapStep label="Light Novel" status={story.formats.lightNovel} accent={story.accent} />
              <RoadmapStep label="Manga / Manhwa" status={story.formats.manga} accent={story.accent} />
              <RoadmapStep label="Animation" status={story.formats.animation} accent={story.accent} />
            </div>
            <p className="mt-4 text-xs text-paper-faint">
              Each format moves forward as the story and reader demand grow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
