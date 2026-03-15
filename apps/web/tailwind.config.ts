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
        display: ["Barlow Condensed", "Impact", "sans-serif"],
      },
      colors: {
        dark: {
          900: "#0d1117",
          800: "#161B22",
          700: "#21262D",
          600: "#30363D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
