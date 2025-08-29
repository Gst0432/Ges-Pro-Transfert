/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Custom Sidebar Colors
				'sidebar-bg': 'hsl(var(--sidebar-bg))',
				'sidebar-text': 'hsl(var(--sidebar-text))',
				'sidebar-text-muted': 'hsl(var(--sidebar-text-muted))',
				'sidebar-active-user': 'hsl(var(--sidebar-active-user))',
				'sidebar-hover-user': 'hsl(var(--sidebar-hover-user))',
				'sidebar-logo-user': 'hsl(var(--sidebar-logo-user))',
				'sidebar-border': 'hsl(var(--sidebar-border))',
        // Admin Sidebar Colors
        'sidebar-admin-bg': 'hsl(var(--sidebar-admin-bg))',
        'sidebar-admin-text': 'hsl(var(--sidebar-admin-text))',
        'sidebar-admin-text-muted': 'hsl(var(--sidebar-admin-text-muted))',
        'sidebar-admin-active': 'hsl(var(--sidebar-admin-active))',
        'sidebar-admin-hover': 'hsl(var(--sidebar-admin-hover))',
        'sidebar-admin-logo-bg': 'hsl(var(--sidebar-admin-logo-bg))',
        'sidebar-admin-border': 'hsl(var(--sidebar-admin-border))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};