import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        card: '#0b0b0d',
        obsidian: {
          950: '#030303',
          900: '#050505',
          850: '#08080a',
          800: '#0d0d10',
          700: '#141418',
          600: '#1e1e24',
          500: '#2b2b33',
        },
        gold: {
          50: '#fdfbf7',
          100: '#f9f5ec',
          200: '#f2e7d0',
          300: '#ecd5aa',
          400: '#e5c07b',
          500: '#d4af37',
          600: '#b89028',
          700: '#946f1c',
          800: '#755518',
          900: '#5e4316',
        },
        alabaster: '#f5f2eb',
        parchment: '#b5afa6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
