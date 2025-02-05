/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily:{
        'Sriracha':['Sriracha', 'serif'],
      },
      colors:{
        'uciblue':'#255699',
        'uciyellow':'#fed302',
      }
    },
  },
  plugins: [
    // Other plugins if you have them, e.g. @tailwindcss/typography
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none', 
          'scrollbar-width': 'none',
          /* Hide scrollbar for Chrome, Safari, and Opera */
          '&::-webkit-scrollbar': {
            display: 'none'
          },
        },
      })
    }
  ],
}
