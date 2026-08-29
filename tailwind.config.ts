import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        paper: "#fbfaf6",
        moss: "#355e4b",
        sage: "#d9e5dc",
        clay: "#b46a55",
        cornflower: "#6d8fc4"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 27, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
