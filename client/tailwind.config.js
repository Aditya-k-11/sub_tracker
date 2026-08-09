export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          text: '#fed8fb',
          bg: '#1c011a',
        },
        primary: {
          DEFAULT: '#fa82fa',
          50: '#fef1fe',
          100: '#fde3fd',
          200: '#fbc5fb',
          300: '#f99ef9',
          400: '#f877f8',
          500: '#fa82fa',
          600: '#d750d7',
          700: '#b432b4',
          800: '#8e268e',
          900: '#752475',
          950: '#4e104e',
        },
        secondary: {
          DEFAULT: '#a6060d',
          50: '#fdf3f4',
          100: '#fbe5e6',
          200: '#f6c5c8',
          300: '#efa2a7',
          400: '#e57077',
          500: '#a6060d',
          600: '#92050b',
          700: '#7a0409',
          800: '#650509',
          900: '#55070a',
          950: '#2f0203',
        },
        accent: {
          DEFAULT: '#f76c2e',
          50: '#fef7f4',
          100: '#fcede5',
          200: '#f9d2be',
          300: '#f5b191',
          400: '#f0895c',
          500: '#f76c2e',
          600: '#e64f0b',
          700: '#c03d07',
          800: '#98320c',
          900: '#7b2b0e',
          950: '#421305',
        },
        danger: {
          DEFAULT: '#a6060d', // Using secondary as danger
        }
      },
      boxShadow: {
        'glow-primary': '0 0 15px -3px rgba(250, 130, 250, 0.4), 0 4px 6px -4px rgba(250, 130, 250, 0.4)',
        'glow-accent': '0 0 15px -3px rgba(247, 108, 46, 0.4), 0 4px 6px -4px rgba(247, 108, 46, 0.4)',
        'glow-danger': '0 0 15px -3px rgba(166, 6, 13, 0.4), 0 4px 6px -4px rgba(166, 6, 13, 0.4)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float': 'float 10s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
