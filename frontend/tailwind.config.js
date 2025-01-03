/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
          "root-background": "url(/background.jpg)"
      },
      fontFamily: {
          inter: ["Inter", "sans-serif"]
      },
      keyframes: {
          dropDown: {
              "0%": { transform: "translateY(-10px)", opacity: 0 },
              "100%": { transform: "translateY(10px)", opacity: 1 }
          }
      }
  },
  },
  plugins: [],
}