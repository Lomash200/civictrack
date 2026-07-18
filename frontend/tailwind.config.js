/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        civic: {
          950: '#0A2E2F',
          900: '#0F3D3E',
          800: '#114B5F',
          700: '#166477',
          600: '#1D7D93',
          100: '#E4F0F1',
          50: '#F7FAFA',
        },
        amber: {
          500: '#F2A93B',
          600: '#DD9227',
        },
        status: {
          pending: '#DD9227',
          assigned: '#2563EB',
          progress: '#7C3AED',
          resolved: '#1F9D55',
          rejected: '#DC2626',
        },
      },
      boxShadow: {
        soft: '0 2px 10px rgba(15, 61, 62, 0.06)',
        card: '0 4px 24px rgba(15, 61, 62, 0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
