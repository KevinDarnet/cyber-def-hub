/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 24px -2px rgba(139, 92, 246, 0.45)',
        'neon-cyan': '0 0 20px -2px rgba(34, 211, 238, 0.35)',
        'glass-dark': '0 16px 40px -12px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-light': '0 12px 32px -8px rgba(99, 102, 241, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.85)',
      },
    },
  },
  plugins: [],
};
