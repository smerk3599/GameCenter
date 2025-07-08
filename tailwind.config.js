/** @type {import('tailwindcss').Config} */
export default {
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
