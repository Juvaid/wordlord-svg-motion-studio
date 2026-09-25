/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wlm: {
          red: '#ff4e2e',
          'red-glow': 'rgba(255, 78, 46, 0.45)',
          dark: '#08090d',
          panel: '#0e1117',
          card: '#13161f',
          input: '#1a1e2a',
          border: '#232734',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
