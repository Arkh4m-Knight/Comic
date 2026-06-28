interface StoryCoverProps {
  title: string;
  accent: string;
  className?: string;
}

// A tasteful typographic placeholder for stories that don't have real
// cover art yet -- deliberately not a random stock photo, since this is
// real original IP, not filler content. Each story gets its own accent
// color within the shared ink/gold identity.
export default function StoryCover({ title, accent, className = "" }: StoryCoverProps) {
  return (
    <svg viewBox="0 0 300 450" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15151B" />
          <stop offset="100%" stopColor="#0E0E11" />
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill={`url(#bg-${title})`} />
      <rect x="10" y="10" width="280" height="430" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
      <line x1="30" y1="225" x2="60" y2="225" stroke={accent} strokeWidth="1.5" />
      <text
        x="150"
        y="215"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontStyle="italic"
        fontSize="26"
        fill="#EDEBE6"
      >
        {title}
      </text>
      <text
        x="150"
        y="245"
        textAnchor="middle"
        fontFamily="var(--font-inter), Arial, sans-serif"
        fontSize="10"
        letterSpacing="2"
        fill={accent}
      >
        COMICMOB ORIGINAL
      </text>
    </svg>
  );
}
