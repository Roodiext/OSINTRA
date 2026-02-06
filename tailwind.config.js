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
        1: '0.225rem',     // 3.6px (90% dari 4px)
        2: '0.45rem',      // 7.2px (90% dari 8px)
        3: '0.675rem',     // 10.8px (90% dari 12px)
        4: '0.9rem',       // 14.4px (90% dari 16px)
        5: '1.125rem',     // 18px (90% dari 20px)
        6: '1.35rem',      // 21.6px (90% dari 24px)
        8: '1.8rem',       // 28.8px (90% dari 32px)
        10: '2.25rem',     // 36px (90% dari 40px)
        12: '2.7rem'       // 43.2px (90% dari 48px)
      },
      fontSize: {
        'xs': ['0.675rem', { lineHeight: '0.9rem' }],      // ~10.8px
        'sm': ['0.7875rem', { lineHeight: '1.125rem' }],    // ~12.6px
        'base': ['0.9rem', { lineHeight: '1.35rem' }],      // 14.4px
        'lg': ['1.0125rem', { lineHeight: '1.575rem' }],    // ~16.2px
        'xl': ['1.125rem', { lineHeight: '1.575rem' }],     // 18px
        '2xl': ['1.35rem', { lineHeight: '1.8rem' }],       // 21.6px
        '3xl': ['1.6875rem', { lineHeight: '2.025rem' }],   // ~27px
        '4xl': ['2.025rem', { lineHeight: '2.25rem' }],     // ~32.4px
        '5xl': ['2.7rem', { lineHeight: '1' }],             // 43.2px
        '6xl': ['3.375rem', { lineHeight: '1' }]            // 54px
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
