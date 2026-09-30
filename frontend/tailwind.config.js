/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07071a",
        navy: {
          950: "#07071a",
          900: "#0f0f2d",
          800: "#16163f",
          700: "#1e1e52",
        },
        electric: {
          violet: "#7c3aed",
          light: "#9061f9",
          dark: "#5b21b6",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        rose: {
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-rose': '0 0 20px rgba(236, 72, 153, 0.4)',
      },
      animation: {
        'aurora-breathe': 'aurora 14s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'scale(1) translate(0%, 0%)', opacity: '0.6' },
          '50%': { transform: 'scale(1.15) translate(-2%, 3%)', opacity: '0.85' },
          '100%': { transform: 'scale(1) translate(2%, -2%)', opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
