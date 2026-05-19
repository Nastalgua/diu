/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./core/**/*.{js,jsx,ts,tsx}", "./domain/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

