/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        slate: {
          750: '#1e293b', /* Balanced intermediate Slate */
          850: '#0f172a', /* Premium deep Slate card background */
          950: '#080d1a', /* Ultimate dark body background */
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.35', boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '50%': { transform: 'scale(1.08)', opacity: '0.7', boxShadow: '0 0 12px 4px rgba(99, 102, 241, 0.2)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideUp: 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}
