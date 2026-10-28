import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: "var(--color-bone, #F3EEE4)",
        surface: "var(--color-surface, #FBF8F2)",
        ink: {
          DEFAULT: "var(--color-ink, #1C1B18)",
          muted: "var(--color-muted-ink, #6B675E)",
        },
        line: "var(--color-line, #E2DBCB)",
        terracotta: {
          DEFAULT: "var(--color-terracotta, #B8522E)",
          hover: "#A34423",
          light: "#FDF5F2",
        },
        sage: {
          DEFAULT: "var(--color-sage, #8A9A7B)",
          light: "#F4F6F2",
          dark: "#6F8060",
        },
        success: {
          DEFAULT: "var(--color-success, #3F6B4A)",
          light: "#F0F5F1",
        },
        warning: {
          DEFAULT: "var(--color-warning, #B07A1E)",
          light: "#FDF9EE",
        },
        danger: {
          DEFAULT: "var(--color-danger, #A3362B)",
          light: "#FCF2F1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 9vw, 8rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h1": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        "h2": ["clamp(1.5rem, 2.75vw, 2.25rem)", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "h3": ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        "h4": ["clamp(1.1rem, 1.5vw, 1.35rem)", { lineHeight: "1.35" }],
        "body": ["clamp(0.95rem, 1vw, 1.05rem)", { lineHeight: "1.6" }],
        "small": ["clamp(0.8rem, 0.9vw, 0.875rem)", { lineHeight: "1.45" }],
        "mono-label": ["clamp(0.7rem, 0.8vw, 0.775rem)", { lineHeight: "1.4", letterSpacing: "0.06em" }],
      },
      borderRadius: {
        "editorial": "14px",
        "editorial-lg": "18px",
        "editorial-xl": "20px",
      },
      boxShadow: {
        "editorial": "0 1px 3px rgba(28, 27, 24, 0.04), 0 8px 24px rgba(28, 27, 24, 0.03)",
        "editorial-raised": "0 2px 6px rgba(28, 27, 24, 0.05), 0 16px 36px rgba(28, 27, 24, 0.06)",
        "editorial-sheet": "0 -10px 40px rgba(28, 27, 24, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

