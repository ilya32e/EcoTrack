/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#007AFF", // Apple Blue
          dark: "#0056B3",
          light: "#3395FF"
        },
        dark: {
          DEFAULT: "#000000",
          surface: "#1C1C1E", // Apple dark gray
          border: "rgba(255, 255, 255, 0.1)"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};

