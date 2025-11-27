/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.jsx',
    './resources/**/*.ts',
    './resources/**/*.tsx',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E8DCC3',
        accent: '#3B4D3A',
        secondary: '#6E8BA3',
        text: '#1E1E1E',
        bg: '#F5F5F5',
      },
      maxWidth: {
        'site': '1200px',
      },
      borderRadius: {
        'lg-2': '12px',
        'lg-3': '16px',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(30,30,30,0.06)'
      },
      spacing: {
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
