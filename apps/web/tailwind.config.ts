import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          900: "#0A0E1A",
          800: "#111827",
          700: "#1F2937",
          600: "#374151",
        },
      },
    },
  },
  plugins: [],
};

export default config;
