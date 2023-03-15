const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'grey': colors.gray[500],
        'grey-medium': colors.gray[400],
        'grey-light': colors.gray[200],
        'grey-dark': colors.gray[600],
        'black': '#000',
        'white': '#fff',
        'btcorange': colors.orange[400],
        'btcorange-effect': colors.orange[500],
        'lightningpurple': '#7B1AF7',
      },
      fontFamily: {
        emoji: ['Apple Color Emoji', 'Segoe UI Emoji', 'NotoColorEmoji', 'Segoe UI Symbol', 'Android Emoji', 'EmojiSymbols', 'EmojiOne Mozilla'],
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.black', 'currentColor'),
      }),
      spacing: {
        '18': '4.5rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spin 1s linear infinite reverse',
        'spin-reverse-slow': 'spin 3s linear infinite reverse',
        'fade-in': 'fade 0.3s ease',
        'fade-in-slow': 'fade 1s ease',
        'fade-out': 'fade 0.3s ease reverse forwards',
        'fade-out-slow': 'fade 1s ease reverse forwards',
      },
      keyframes: {
        'spin': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'fade': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
      },
    },
    screens: {
      'xs': '475px',
      ...defaultTheme.screens,
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.break-anywhere': {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
      })
    }),
  ],
}
