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
        // Golden theme colors
        golden: {
          50: 'hsl(54 91% 95%)',
          100: 'hsl(54 96% 88%)',
          200: 'hsl(53 98% 77%)',
          300: 'hsl(50 97% 63%)',
          400: 'hsl(47 96% 53%)',
          500: 'hsl(45 93% 47%)',
          600: 'hsl(41 96% 40%)',
          700: 'hsl(35 91% 33%)',
          800: 'hsl(32 81% 29%)',
          900: 'hsl(28 73% 26%)',
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
        pulseGolden: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        sparkleMove: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        gradientShift: 'gradientShift 15s ease infinite',
        pulseGolden: 'pulseGolden 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sparkleMove: 'sparkleMove 10s linear infinite',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'golden-gradient': 'linear-gradient(135deg, hsl(45 93% 47%) 0%, hsl(41 96% 40%) 50%, hsl(35 91% 33%) 100%)',
        'golden-gradient-soft': 'linear-gradient(135deg, hsl(54 91% 95%) 0%, hsl(54 96% 88%) 100%)',
        'golden-radial': 'radial-gradient(circle at center, hsl(45 93% 47%) 0%, hsl(41 96% 40%) 100%)',
      },
      boxShadow: {
        'golden': '0 4px 14px 0 hsl(45 93% 47% / 0.15)',
        'golden-lg': '0 20px 40px -8px hsl(45 93% 47% / 0.15), 0 8px 16px -8px hsl(45 93% 47% / 0.1)',
        'golden-xl': '0 25px 50px -12px hsl(45 93% 47% / 0.25)',
        'glow-golden': '0 0 20px hsl(45 93% 47% / 0.3)',
        'glow-golden-lg': '0 0 30px hsl(45 93% 47% / 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}