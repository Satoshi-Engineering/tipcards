import { fileURLToPath } from 'node:url'
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    fileURLToPath(new URL('./index.html', import.meta.url)),
    fileURLToPath(new URL('./src/**/*.{vue,ts}', import.meta.url)),
  ],
  theme: {
    extend: {
      // todo - check with @dave do we need the default colors? we could move colors outside of extend
      colors: {
        // todo - check with @dave if we should rename them (e.g. yellow -> primary, bluegrey -> grey.DEFAULT or grey.blue)
        // tailwind recommends using color names and not abstract names (no "primary")
        yellow: '#f2cc50', // primary color
        black: '#010101', // headlines, labels
        bluegrey: '#2a2c31', // default color
        lightgrey: '#f6f7f7', // backgrounds

        // todo - check with @dave if those colors are still needed
        grey: {
          light: colors.gray[200],
          medium: colors.gray[400],
          DEFAULT: colors.gray[500],
          dark: colors.gray[600],
        },
        white: '#fff',
        btcorange: {
          DEFAULT: colors.orange[400],
          effect: colors.orange[500],
        },
        lightningpurple: '#7B1AF7',
      },
      fontFamily: {
        // todo - check with @dave how do I get notosans to work?
        sans: ['NotoSans', ...defaultTheme.fontFamily.sans],
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
    plugin(({ addUtilities }) => {
      addUtilities({
        '.break-anywhere': {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
      })
    }),
  ],
} satisfies Config
