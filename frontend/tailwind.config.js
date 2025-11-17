/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cwBlue: "#3b82f6",   // vibrant accent blue
        cwDark: "#0f172a",   // near-black navy background
        cwMedium: "#1e293b", // dark gray-blue panels
        cwLight: "#334155",  // lighter slate
        cwAccent: "#fbbf24", // warm gold
        cwText: "#e2e8f0",   // light text
      },
    },
  },
  plugins: [],
};
