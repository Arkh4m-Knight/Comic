import StoryCover from "@/src/components/StoryCover";

interface CoverProps {
  title: string;
  accent: string;
  coverUrl?: string | null;
  className?: string;
}

export default function Cover({ title, accent, coverUrl, className = "" }: CoverProps) {
  if (coverUrl) {
    return <img src={coverUrl} alt={title} className={`object-cover ${className}`} />;
  }
  return <StoryCover title={title} accent={accent} className={className} />;
}
