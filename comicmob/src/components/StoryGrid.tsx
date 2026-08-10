import Cover from "@/src/components/Cover";
import type { DbStory } from "@/src/lib/stories-db";

interface StoryGridProps {
  stories: DbStory[];
  showCreator?: boolean;
}

export default function StoryGrid({ stories, showCreator }: StoryGridProps) {
  return (
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
            {showCreator && story.creator_name && (
              <p className="mt-1 text-[11px] text-paper-faint">by {story.creator_name}</p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-paper-soft">{story.hook}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
