/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'ios': {
          'bg-primary': '#000000',
          'bg-secondary': '#111111',
          'bg-tertiary': '#1a1a1a',
          'bg-card': '#1c1c1e',
          'bg-elevated': '#2c2c2e',
          'text-primary': '#ffffff',
          'text-secondary': '#ebebf5',
          'text-tertiary': '#ebebf599',
          'border': '#38383a',
          'accent': '#007aff',
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
} 