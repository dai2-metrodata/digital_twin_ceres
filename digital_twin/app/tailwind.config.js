/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        machine: { dark: '#1a1a2e', mid: '#16213e', light: '#0f3460', accent: '#e94560' }
      }
    }
  },
  plugins: []
}
