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
          50: '#fef7ec',
          100: '#fcecd3',
          200: '#f9d6a5',
          300: '#f5b96e',
          400: '#f19535',
          500: '#ee7b14',
          600: '#de5f0a',
          700: '#b8450b',
          800: '#933710',
          900: '#782f11',
          950: '#411505',
        },
        neutral: {
          850: '#1f2129',
          950: '#0c0d10',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
