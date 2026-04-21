/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#f5f5f0',
          sidebar: '#111111',
          card: '#ffffff',
        },
        accent: '#c8f135',
        'accent-hover': '#b8e020',
        'accent-tint': '#f7fee7',
        border: {
          subtle: '#e8e8e8',
          input: '#e8e8e8',
        },
        text: {
          primary: '#1a1a1a',
          body: '#444444',
          muted: '#888888',
          hint: '#aaaaaa',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        lime: {
          accent: '#c8f135',
          hover: '#b8e020',
          light: '#f7fee7',
        },
        sidebar: '#111111',
        surface: '#f5f5f0',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        chip: '8px',
        card: '16px',
        pill: '99px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
