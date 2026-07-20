/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f8fb',
          100: '#eaeff5',
          200: '#cfd9e6',
          300: '#a7b8cf',
          400: '#6f86a8',
          500: '#4a6088',
          600: '#344b6e',
          700: '#273958',
          800: '#1a2740',
          900: '#0f1a30',
          950: '#070d1c',
        },
        shield: {
          50: '#ecfdfb',
          100: '#cffaf3',
          200: '#9ff4e8',
          300: '#5fe8d6',
          400: '#2ed3bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#10755f',
          800: '#115d50',
          900: '#134c42',
        },
        risk: {
          safe: '#10b981',
          suspicious: '#f59e0b',
          phishing: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(20, 184, 166, 0.35)',
        'glow-risk': '0 0 40px -10px rgba(239, 68, 68, 0.4)',
        card: '0 1px 3px rgba(15,26,48,0.06), 0 8px 24px -12px rgba(15,26,48,0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '70%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.35s ease-out both',
        'ring-pulse': 'ring-pulse 2s ease-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
