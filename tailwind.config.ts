import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme color palette from planning.md
        background: {
          primary: '#0a0a0a', // deep black
          secondary: '#1a1a1a', // dark charcoal
          tertiary: '#252525', // medium charcoal
          input: '#2a2a2a', // lighter charcoal
        },
        border: {
          primary: '#333333',
          secondary: '#444444',
          tertiary: '#555555',
        },
        accent: {
          primary: '#00ff88', // neon green
          emergency: '#ff3838', // bright red
          warning: '#ff9800', // orange
          success: '#00ff88', // same as primary
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#bbbbbb',
          muted: '#999999',
        }
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'lg': '8px',
        'md': '6px',
        'sm': '4px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config