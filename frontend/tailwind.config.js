/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandBlue: '#2e79e3',
        brandPink: '#f01c71',
        brandInk: '#273c2e',
        brandSand: '#fff7eb',
        brandGold: '#dccaaa',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(39, 60, 46, 0.12)',
      },
    },
  },
  plugins: [],
};