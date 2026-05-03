/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#d9e7ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598bff',
          500: '#3366ff',
          600: '#1a44f5',
          700: '#1332e1',
          800: '#1629b6',
          900: '#18288f',
          950: '#131c57',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b000',
          600: '#c49500',
        },
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(19,28,87,0.10)',
        glow: '0 0 20px 0 rgba(51,102,255,0.25)',
      },
      backgroundImage: {
        'city-gradient': 'linear-gradient(135deg, #131c57 0%, #1a44f5 100%)',
      },
    },
  },
  plugins: [],
};
