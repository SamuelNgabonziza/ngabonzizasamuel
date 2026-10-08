/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./*.html', './src/**/*.{js,jsx}', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#F6F4EF',
          surface: '#FFFFFF',
          primary: '#6D28D9',
          secondary: '#EDE9FE',
          accent: '#E4572E',
          cyan: '#0891B2',
          rose: '#DB2777',
          gold: '#B45309',
          mint: '#047857',
          sky: '#2563EB',
          text: '#201A2C',
          muted: '#655F70',
          border: '#E5E0E9'
        },
        dark: {
          background: '#111018',
          surface: '#1B1823',
          primary: '#C4B5FD',
          secondary: '#2D2540',
          accent: '#FDA58A',
          cyan: '#67E8F9',
          rose: '#F9A8D4',
          gold: '#FCD34D',
          mint: '#6EE7B7',
          sky: '#93C5FD',
          text: '#F7F4FB',
          muted: '#BEB7C9',
          border: '#3B3548'
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 14px 45px rgba(42, 28, 70, .10)',
        'glass-dark': '0 16px 48px rgba(0, 0, 0, .30)'
      },
      maxWidth: { reading: '68ch' }
    }
  },
  plugins: []
};
