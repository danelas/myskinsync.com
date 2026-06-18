import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, premium "skin-tech" palette
        cream: "#FBF7F2",
        sand: "#F1E7DB",
        ink: "#211D18",
        blush: "#F4C7C3",
        sage: "#9CAF88",
        clay: "#C97D60",
        clayDark: "#A85F45",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["Fraunces", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(33,29,24,0.04), 0 8px 24px -12px rgba(33,29,24,0.12)",
        lift: "0 2px 4px rgba(33,29,24,0.05), 0 18px 40px -18px rgba(33,29,24,0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
