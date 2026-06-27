import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0E0E11", // page background
          900: "#17171B", // panel / card surface
          800: "#1E1E23", // raised surface (hover, inputs)
        },
        line: {
          DEFAULT: "#2A2A2F",
          soft: "#202024",
        },
        paper: {
          DEFAULT: "#EDEBE6", // primary text, warm off-white "ink on the page"
          soft: "#8C8A84", // secondary / metadata text
          faint: "#5C5A56",
        },
        foil: {
          DEFAULT: "#C9A227", // signature accent — museum gold-foil
          bright: "#E0BC4A",
          soft: "#2A2410", // tinted background for badges
        },
        // Keep `brand` as an alias so nothing breaks while we migrate call sites.
        brand: {
          DEFAULT: "#C9A227",
          dark: "#A9851E",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
    },
  },
  plugins: [],
} satisfies Config;
