import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noa: {
          ivory: "#F8F1EB",
          "ivory-light": "#FCFAF8",
          "ivory-dark": "#ECE2D8",
          chocolate: "#683B0C",
          "chocolate-dark": "#432405",
          "chocolate-light": "#8C5216",
          caramel: "#D1A37A",
          "caramel-light": "#E5C5A8",
          "caramel-dark": "#B27D51",
          gold: "#C69255",
          charcoal: "#2A231F",
          sand: "#F0E6DC",
          cream: "#FFFDF9",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(104, 59, 12, 0.05)",
        card: "0 4px 20px rgba(104, 59, 12, 0.08)",
        floating: "0 10px 30px rgba(104, 59, 12, 0.15)",
        drawer: "0 -10px 40px rgba(67, 36, 5, 0.2)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideUp: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseSubtle: "pulseSubtle 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
