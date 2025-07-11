/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-grey": "#1a1a1a",
        "bright-green": "#00cc7e",
      },
    },
  },
  plugins: [],
};
