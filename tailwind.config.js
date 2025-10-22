/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'floatAnimation': 'floatAnimation 3s ease-in-out infinite',
        'heartbeatPulse': 'heartbeatPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        floatAnimation: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },
        heartbeatPulse: {
          '0%': {
            transform: 'translateX(-50%) scale(1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          },
          '14%': {
            transform: 'translateX(-50%) scale(1.05)',
            boxShadow: '0 6px 20px rgba(255, 182, 193, 0.4)',
          },
          '28%': {
            transform: 'translateX(-50%) scale(1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          },
          '42%': {
            transform: 'translateX(-50%) scale(1.08)',
            boxShadow: '0 8px 25px rgba(255, 182, 193, 0.6)',
          },
          '70%': {
            transform: 'translateX(-50%) scale(1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      borderWidth: {
        '3': '3px',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
