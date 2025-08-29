/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        'yellow': {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      backgroundImage: {
        'yellow-blue-gradient': 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 100%)',
        'yellow-blue-gradient-soft': 'linear-gradient(135deg, #fef3c7 0%, #dbeafe 100%)',
      },
      boxShadow: {
        'yellow-blue-lg': '0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
        'yellow-blue-xl': '0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}