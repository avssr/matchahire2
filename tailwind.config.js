/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          800: '#1B5E20',
          600: '#2E7D32',
          400: '#66BB6A',
          200: '#A5D6A7',
          50: '#E8F5E9',
        },
        teal: {
          600: '#00BFA5',
        },
      },
    },
  },
  plugins: [],
} 