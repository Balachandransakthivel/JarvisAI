import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'j-bg': '#050810',
        'j-surface': '#080c18',
        'j-border': '#0d1f35',
        'j-cyan': '#00d4ff',
        'j-cyan-dim': '#007799',
        'j-blue': '#0066ff',
        'j-text': '#a8d8e8',
        'j-text-dim': '#4a7a8a',
        'j-red': '#ff4444',
        'j-green': '#00ff88',
        'j-yellow': '#ffcc00',
        border: '#0d1f35',
        background: '#050810',
        foreground: '#a8d8e8',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      animation: {
        'spin-cw': 'spin-cw 12s linear infinite',
        'spin-ccw': 'spin-ccw 18s linear infinite',
        'orb-pulse': 'orb-pulse 3s ease-in-out infinite',
        'listen-pulse': 'listen-pulse 1s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'bar-wave': 'bar-wave 1.2s ease-in-out infinite',
        'flicker': 'flicker 5s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        'spin-cw': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-ccw': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'orb-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0,212,255,0.2), 0 0 40px rgba(0,212,255,0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.25)',
          },
        },
        'listen-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 30px rgba(0,212,255,0.7), 0 0 60px rgba(0,212,255,0.3)',
          },
          '50%': {
            boxShadow: '0 0 60px rgba(0,212,255,1), 0 0 120px rgba(0,212,255,0.5)',
          },
        },
        'scan-line': {
          '0%': { top: '-4px', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'bar-wave': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        flicker: {
          '0%, 89%, 91%, 93%, 100%': { opacity: '1' },
          '90%': { opacity: '0.7' },
          '92%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
