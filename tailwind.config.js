/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        issy: {
          pink: '#f8c5c5', // Soft pink theme background
          darkPink: '#e5a1a1',
          accent: '#d64d4d', // Pixel button color
          accentDark: '#b03b3b',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'], // Retro pixel font
      },
    },
  },
  plugins: [],
}
