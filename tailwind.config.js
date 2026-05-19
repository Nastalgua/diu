/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './core/**/*.{js,jsx,ts,tsx}',
    './domain/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — reference CSS vars, not raw hex
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-lt': 'rgb(var(--color-accent-lt) / <alpha-value>)',
        'accent-dk': 'rgb(var(--color-accent-dk) / <alpha-value>)',
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        hint: 'rgb(var(--color-text-hint) / <alpha-value>)',
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        chip: '6px',
      },
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({
        ':root': {
          // Light mode (warm sand & coral)
          '--color-bg': '245 239 230', // #F5EFE6
          '--color-surface': '255 250 247', // #FFFAF7
          '--color-border': '237 216 200', // #EDD8C8
          '--color-accent': '216 90 48', // #D85A30
          '--color-accent-lt': '250 236 231', // #FAECE7
          '--color-accent-dk': '153 60 29', // #993C1D
          '--color-text-primary': '44 24 16', // #2C1810
          '--color-text-muted': '154 106 85', // #9A6A55
          '--color-text-hint': '196 160 144', // #C4A090
        },
        // Dark mode overrides — same variable names, different values
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            '--color-bg': '44 24 16', // #2C1810
            '--color-surface': '61 35 24', // #3D2318
            '--color-border': '90 51 40', // #5A3328
            '--color-accent': '240 153 123', // #F0997B  (coral-200, readable on dark)
            '--color-accent-lt': '113 43 19', // #712B13
            '--color-accent-dk': '245 196 179', // #F5C4B3
            '--color-text-primary': '245 239 230', // #F5EFE6
            '--color-text-muted': '196 160 144', // #C4A090
            '--color-text-hint': '138 90 74', // #8A5A4A
          },
        },
      }),
  ],
};
