/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          sidebar: '#0d0d18',
          card: '#0f0f1a',
        },
        accent: '#7c6af7',
        'accent-tint': '#1e1a3a',
        border: {
          subtle: '#1e1e2e',
          input: '#2a2a3a',
        },
        text: {
          primary: '#ffffff',
          body: '#c0c0d0',
          muted: '#6a6a8a',
          hint: '#3a3a4a',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        chip: '8px',
        card: '12px',
        pill: '99px',
      },
    },
  },
  plugins: [],
}

