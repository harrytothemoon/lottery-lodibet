/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "law-blue": "#1E2732",
        "law-gold": "#F7D538",
      },
      backgroundImage: {
        "law-gradient":
          "linear-gradient(180deg, #ecdc91, #fff4c1 51.56%, #ffb600, #655d7c)",
      },
    },
  },
  plugins: [],
};

