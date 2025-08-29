/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Yellow-Blue theme colors
        yellow: {
          50: 'hsl(54 100% 97%)',
          100: 'hsl(54 100% 92%)',
          200: 'hsl(54 100% 85%)',
          300: 'hsl(45 100% 75%)',
          400: 'hsl(45 100% 65%)',
          500: 'hsl(45 100% 50%)',
          600: 'hsl(38 100% 45%)',
          700: 'hsl(32 100% 40%)',
          800: 'hsl(28 100% 35%)',
          900: 'hsl(25 100% 30%)',
        },
        blue: {
          50: 'hsl(214 100% 97%)',
          100: 'hsl(214 100% 92%)',
          200: 'hsl(214 100% 85%)',
          300: 'hsl(214 100% 75%)',
          400: 'hsl(214 100% 65%)',
          500: 'hsl(214 100% 50%)',
          600: 'hsl(214 100% 45%)',
          700: 'hsl(214 100% 40%)',
          800: 'hsl(214 100% 35%)',
          900: 'hsl(214 100% 30%)',
        },
        // Sidebar colors
        'sidebar-bg': 'hsl(var(--sidebar-bg))',
        'sidebar-text': 'hsl(var(--sidebar-text))',
        'sidebar-text-muted': 'hsl(var(--sidebar-text-muted))',
        'sidebar-active-user': 'hsl(var(--sidebar-active-user))',
        'sidebar-hover-user': 'hsl(var(--sidebar-hover-user))',
        'sidebar-logo-user': 'hsl(var(--sidebar-logo-user))',
        'sidebar-border': 'hsl(var(--sidebar-border))',
        'sidebar-admin-bg': 'hsl(var(--sidebar-admin-bg))',
        'sidebar-admin-text': 'hsl(var(--sidebar-admin-text))',
        'sidebar-admin-text-muted': 'hsl(var(--sidebar-admin-text-muted))',
        'sidebar-admin-active': 'hsl(var(--sidebar-admin-active))',
        'sidebar-admin-hover': 'hsl(var(--sidebar-admin-hover))',
        'sidebar-admin-logo-bg': 'hsl(var(--sidebar-admin-logo-bg))',
        'sidebar-admin-border': 'hsl(var(--sidebar-admin-border))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseYellowBlue: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px hsl(214 100% 50% / 0.3)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px hsl(45 100% 50% / 0.4)'
          },
        },
        sparkleMove: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        borderSlide: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        pageSlideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        gradientShift: 'gradientShift 12s ease infinite',
        pulseYellowBlue: 'pulseYellowBlue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sparkleMove: 'sparkleMove 10s linear infinite',
        borderSlide: 'borderSlide 3s infinite',
        pageSlideIn: 'pageSlideIn 0.5s ease-out',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'yellow-blue-gradient': 'linear-gradient(135deg, hsl(45 100% 50%) 0%, hsl(214 100% 50%) 100%)',
        'yellow-blue-gradient-soft': 'linear-gradient(135deg, hsl(54 100% 97%) 0%, hsl(214 100% 97%) 50%, hsl(54 100% 92%) 100%)',
        'yellow-radial': 'radial-gradient(circle at center, hsl(45 100% 50%) 0%, hsl(38 100% 45%) 100%)',
        'blue-radial': 'radial-gradient(circle at center, hsl(214 100% 50%) 0%, hsl(214 100% 45%) 100%)',
      },
      boxShadow: {
        'yellow': '0 4px 14px 0 hsl(45 100% 50% / 0.15)',
        'blue': '0 4px 14px 0 hsl(214 100% 50% / 0.15)',
        'yellow-blue': '0 4px 14px 0 hsl(214 100% 50% / 0.15), 0 2px 8px 0 hsl(45 100% 50% / 0.1)',
        'yellow-blue-lg': '0 20px 40px -8px hsl(214 100% 50% / 0.2), 0 8px 16px -8px hsl(45 100% 50% / 0.15)',
        'yellow-blue-xl': '0 25px 50px -12px hsl(214 100% 50% / 0.25), 0 0 20px hsl(45 100% 50% / 0.15)',
        'glow-yellow': '0 0 20px hsl(45 100% 50% / 0.4)',
        'glow-blue': '0 0 20px hsl(214 100% 50% / 0.4)',
        'glow-yellow-blue': '0 0 30px hsl(214 100% 50% / 0.2), 0 0 20px hsl(45 100% 50% / 0.15)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}