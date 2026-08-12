/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5fd',
          100: '#c1e3fb',
          200: '#9ad1f9',
          400: '#4db5f7',
          500: '#1d9bf0',
          600: '#1a8cd8',
          700: '#1677b5',
          800: '#126292',
          900: '#0e4e75',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 0 20px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(29, 155, 240, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'heart-pop': 'heartPop 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
