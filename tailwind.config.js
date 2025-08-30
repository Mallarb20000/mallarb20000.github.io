/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#2563eb',
        'brand-dark': '#1d4ed8',
        'success-light': '#dcfce7',
        'success-dark': '#166534',
        'warning-light': '#fef3c7',
        'warning-dark': '#d97706',
        'danger-light': '#fee2e2',
        'danger-dark': '#dc2626',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}