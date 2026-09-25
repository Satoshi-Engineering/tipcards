import { fileURLToPath } from 'node:url'
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    fileURLToPath(new URL('./index.html', import.meta.url)),
    fileURLToPath(new URL('./src/**/*.{vue,ts}', import.meta.url)),
  ],
  theme: {
    extend: {
      // move colors outside extend when new design is finished
      colors: {
        yellow: {
          DEFAULT: '#f2cc50', // primary color
          light: '#FDF5DD',
          dark: '#ca8a04',
        },
        black: '#010101', // headlines, labels
        bluegrey: '#2a2c31', // default color
        green: {
          DEFAULT: '#99be5a', // statistics
          light: '#EBF3DF', // statistics
          200: '#bbf7d0',
          500: '#22c55e',
        },
        red: {
          DEFAULT: '#c05749', // statistics
          light: '#F3DEDB', // statistics
          500: '#ef4444',
        },
        white: {
          DEFAULT: '#ffffff', // white
          50: '#8a8b8b', // use on bluegrey background for subtext & dividers
        },
        blue: {
          DEFAULT: '#2865eb',
          light: '#ebf7ff',
        },
        blueViolet: {
          DEFAULT: '#4a5b9e',
          light: '#CCCFDB',
        },

        grey: {
          light: '#f6f7f7', // backgrounds

          // deprecated colors - remove when new design is finished
          medium: '#9ca3af',
          DEFAULT: '#6b7280',
          dark: '#4b5563',
        },
        gray: {
          200: '#e5e7eb',
          300: '#d1d5db',
        },

        // deprecated colors - remove when new design is finished
        btcorange: {
          DEFAULT: '#fb923c',
          effect: '#f97316',
        },
        lightningpurple: '#7B1AF7',
      },
      fontFamily: {
        sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
        lato: ['Lato', ...defaultTheme.fontFamily.sans],
        emoji: ['Apple Color Emoji', 'Segoe UI Emoji', 'NotoColorEmoji', 'Segoe UI Symbol', 'Android Emoji', 'EmojiSymbols', 'EmojiOne Mozilla'],
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.black', 'currentColor'),
      }),
      blur: {
        'xs': '0.125rem',
        'sm': '0.25rem',
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        'default': '0.857rem',
      },
      boxShadow: {
        'default': '0 2px 15px 0 rgba(97, 97, 97, 0.3)',
        'default-flat': '0 1px 7px 0 rgba(97, 97, 97, 0.2)',
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
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.break-anywhere': {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
        '.transition-discrete': {
          transitionBehavior: 'allow-discrete',
        },
        '.scrollbar-gutter-stable': {
          scrollbarGutter: 'stable',
        },
      })
    }),
  ],
} satisfies Config
