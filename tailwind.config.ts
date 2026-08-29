import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        paper: "#f7f8fa",
        moss: "#355e4b",
        sage: "#e7f0e9",
        clay: "#b46a55",
        cornflower: "#6d8fc4"
      },
      boxShadow: {
        soft: "0 2px 8px rgba(32, 33, 36, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
