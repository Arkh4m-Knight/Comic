interface OpenBookProps {
  accent: string;
  className?: string;
}

// A simple line-art open book, used as the visual centerpiece on each
// story's hub page. Tinted with that story's accent color rather than a
// literal 3D render -- keeps it consistent with the rest of the site's
// flat, hairline-drawn aesthetic instead of introducing a different
// rendering style just for this one element.
export default function OpenBook({ accent, className = "" }: OpenBookProps) {
  return (
    <svg viewBox="0 0 420 280" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="bookGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="210" cy="140" rx="190" ry="120" fill="url(#bookGlow)" />

      {/* Left page */}
      <path
        d="M210 40 L40 62 L40 232 L210 252 Z"
        fill="#15151B"
        stroke={accent}
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {/* Right page */}
      <path
        d="M210 40 L380 62 L380 232 L210 252 Z"
        fill="#15151B"
        stroke={accent}
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {/* Spine */}
      <line x1="210" y1="40" x2="210" y2="252" stroke={accent} strokeOpacity="0.7" strokeWidth="1.5" />

      {/* Text lines, left page */}
      {[90, 112, 134, 156, 178].map((y, i) => (
        <line
          key={`l-${i}`}
          x1="62"
          y1={y}
          x2={i === 4 ? "150" : "188"}
          y2={y - 6}
          stroke="#3A3A40"
          strokeWidth="1"
        />
      ))}
      {/* Text lines, right page */}
      {[90, 112, 134, 156, 178].map((y, i) => (
        <line
          key={`r-${i}`}
          x1="232"
          y1={y - 6}
          x2={i === 4 ? "320" : "358"}
          y2={y}
          stroke="#3A3A40"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
