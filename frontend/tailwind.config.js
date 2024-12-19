/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors:{
        'uciblue':'#255699',
        'uciyellow':'#fed302',
      }
    },
  },
  plugins: [],
}
