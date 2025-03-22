/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2a3990',
          dark: '#1e2a6e'
        },
        success: {
          DEFAULT: '#27ae60',
          dark: '#219653'
        },
        danger: {
          DEFAULT: '#e74c3c',
          dark: '#c0392b'
        }
      }
    }
  },
  plugins: []
}
