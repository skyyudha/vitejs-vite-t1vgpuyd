/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Kita menambahkan warna custom di sini
      colors: {
        brand: {
          DEFAULT: '#0f172a', // Slate 900 - Biru tua kehitaman yang elegan
          light: '#1e293b', // Slate 800 - Sedikit lebih terang untuk hover
          accent: '#3b82f6', // Blue 500 - Untuk highlight kecil (opsional)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
