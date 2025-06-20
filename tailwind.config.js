/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        construction: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        neon: {
          pink: '#ff0080',
          blue: '#00d4ff',
          purple: '#8b5cf6',
          green: '#00ff94',
          orange: '#ff6b35',
          yellow: '#ffd700',
        },
        cyber: {
          bg: '#0a0a0f',
          card: '#1a1a2e',
          border: '#16213e',
          accent: '#0f3460',
          text: '#e94560',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': "url(\"data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23334155' fill-opacity='0.1'%3e%3cpath d='M30 30h30v30H30V30zm15 15v15h15V45H45z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e\")",
      },
      boxShadow: {
        'neon-pink': '0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 80px #ff0080',
        'neon-blue': '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff',
        'neon-purple': '0 0 20px #8b5cf6, 0 0 40px #8b5cf6, 0 0 80px #8b5cf6',
        'neon-green': '0 0 20px #00ff94, 0 0 40px #00ff94, 0 0 80px #00ff94',
        'cyber': '0 4px 15px 0 rgba(139, 92, 246, 0.3), 0 10px 25px 0 rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          from: { filter: 'drop-shadow(0 0 20px #8b5cf6)' },
          to: { filter: 'drop-shadow(0 0 30px #8b5cf6) drop-shadow(0 0 40px #8b5cf6)' }
        }
      }
    },
  },
  plugins: [],
}

