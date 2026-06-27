interface GoldGlyphProps {
  className?: string;
}

// A glossy, gradient-shaded abstract burst — meant to evoke the satisfying
// "glossy 3D object floating in space" feeling from glossy chrome SaaS
// hero trends, but rendered as a comics-native motif (an impact/sparkle
// burst, like ink hitting paper) in our gold-foil palette instead of
// generic chrome. Pure SVG/CSS, no 3D asset pipeline required.
export default function GoldGlyph({ className = "" }: GoldGlyphProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldBody" x1="15%" y1="10%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#F4E4B0" />
          <stop offset="35%" stopColor="#E0BC4A" />
          <stop offset="65%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#7A5E14" />
        </linearGradient>
        <radialGradient id="goldHighlight" cx="32%" cy="22%" r="40%">
          <stop offset="0%" stopColor="#FFFDF4" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFFDF4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFDF4" stopOpacity="0" />
        </radialGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" result="blur" />
        </filter>
      </defs>

      {/* Ambient glow */}
      <circle cx="200" cy="200" r="120" fill="#C9A227" opacity="0.25" filter="url(#goldGlow)" />

      {/* Back shape — offset, dimmer, for a sense of depth */}
      <path
        d="M200.0 46.3 L218.3 137.6 L278.4 78.0 L252.1 154.9 L326.6 142.2 L264.3 190.7 L352.1 221.9 L259.1 227.0 L305.2 291.2 L237.3 258.0 L240.9 339.1 L200.0 265.0 L156.7 347.5 L164.9 254.7 L90.4 295.0 L137.3 228.6 L62.2 219.8 L135.7 190.7 L60.2 136.2 L150.9 157.4 L124.7 82.9 L180.6 133.9 Z"
        fill="#7A5E14"
        opacity="0.3"
        transform="translate(12 16) scale(0.95)"
      />

      {/* Main glossy burst */}
      <path
        d="M200.0 46.3 L218.3 137.6 L278.4 78.0 L252.1 154.9 L326.6 142.2 L264.3 190.7 L352.1 221.9 L259.1 227.0 L305.2 291.2 L237.3 258.0 L240.9 339.1 L200.0 265.0 L156.7 347.5 L164.9 254.7 L90.4 295.0 L137.3 228.6 L62.2 219.8 L135.7 190.7 L60.2 136.2 L150.9 157.4 L124.7 82.9 L180.6 133.9 Z"
        fill="url(#goldBody)"
        stroke="#7A5E14"
        strokeWidth="1"
      />

      {/* Specular highlight */}
      <path
        d="M200.0 46.3 L218.3 137.6 L278.4 78.0 L252.1 154.9 L326.6 142.2 L264.3 190.7 L352.1 221.9 L259.1 227.0 L305.2 291.2 L237.3 258.0 L240.9 339.1 L200.0 265.0 L156.7 347.5 L164.9 254.7 L90.4 295.0 L137.3 228.6 L62.2 219.8 L135.7 190.7 L60.2 136.2 L150.9 157.4 L124.7 82.9 L180.6 133.9 Z"
        fill="url(#goldHighlight)"
      />
    </svg>
  );
}
