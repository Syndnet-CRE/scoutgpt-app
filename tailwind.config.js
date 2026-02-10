/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        scout: {
          bg: '#0a0f1a',
          surface: '#111827',
          border: '#1e293b',
          accent: '#3b82f6',
          'accent-dim': '#1e40af',
          text: '#e2e8f0',
          'text-dim': '#94a3b8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          panel: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
