const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/app/**/*.{js,ts,jsx,tsx}',
    './renderer/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
      // primary: '#1DA1F2',
      primary: {
        100: '#E8F5FD',
        200: '#C9E8FB',
        300: '#A9DBF9',
        400: '#6ABFF5',
        500: '#1DA1F2', // default
        600: '#1A91DA',
        700: '#1271A8',
        800: '#0D5276',
        900: '#09364E'
      },
      secondary: '#004c8c',
    },
    extend: {
      height: {
        'screen-93': '93vh',
      },
      transitionProperty: {
        'color': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      }
    },
  },
  plugins: [],
}