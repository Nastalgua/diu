/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './core/**/*.{js,jsx,ts,tsx}',
    './domain/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // FONTS
      fontFamily: {
        sans: ['Inter-Regular'], // font-sans -> body copy
        medium: ['Inter-Medium'], // font-medium -> titles, labels
      },

      // COLORS
      // All values use CSS variable references so light/dark
      // swap happens automatically via a single :root override.
      // The `/ <alpha-value>` syntax enables bg-accent/50 etc.
      colors: {
        // Surfaces
        bg: 'rgb(var(--color-bg)      / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border)  / <alpha-value>)',

        // Accent — coral
        accent: 'rgb(var(--color-accent)      / <alpha-value>)',
        'accent-lt': 'rgb(var(--color-accent-lt)   / <alpha-value>)',
        'accent-dk': 'rgb(var(--color-accent-dk)   / <alpha-value>)',

        // Text
        primary: 'rgb(var(--color-text-primary)   / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted)     / <alpha-value>)',
        hint: 'rgb(var(--color-text-hint)      / <alpha-value>)',

        // Semantic — success (green)
        success: 'rgb(var(--color-success)      / <alpha-value>)',
        'success-lt': 'rgb(var(--color-success-lt)   / <alpha-value>)',
        'success-dk': 'rgb(var(--color-success-dk)   / <alpha-value>)',

        // Semantic — error (red)
        danger: 'rgb(var(--color-danger)      / <alpha-value>)',
        'danger-lt': 'rgb(var(--color-danger-lt)   / <alpha-value>)',
        'danger-dk': 'rgb(var(--color-danger-dk)   / <alpha-value>)',

        // Semantic — info (blue)
        info: 'rgb(var(--color-info)      / <alpha-value>)',
        'info-lt': 'rgb(var(--color-info-lt)   / <alpha-value>)',
        'info-dk': 'rgb(var(--color-info-dk)   / <alpha-value>)',

        // Semantic — warning (amber)
        warning: 'rgb(var(--color-warning)      / <alpha-value>)',
        'warning-lt': 'rgb(var(--color-warning-lt)   / <alpha-value>)',
        'warning-dk': 'rgb(var(--color-warning-dk)   / <alpha-value>)',

        // Card semantics — shared pill text / dot ramps
        teal: 'rgb(var(--color-teal)        / <alpha-value>)',
        'teal-dk': 'rgb(var(--color-teal-dk)     / <alpha-value>)',
        violet: 'rgb(var(--color-violet)      / <alpha-value>)',
        'violet-dk': 'rgb(var(--color-violet-dk)   / <alpha-value>)',

        // Feed cards — issue (coral)
        'card-issue': 'rgb(var(--color-card-issue) / <alpha-value>)',
        'card-issue-pill':
          'rgb(var(--color-card-issue-pill) / <alpha-value>)',

        // Feed cards — meeting (teal)
        'card-meeting': 'rgb(var(--color-card-meeting) / <alpha-value>)',
        'card-meeting-pill':
          'rgb(var(--color-card-meeting-pill) / <alpha-value>)',

        // Feed cards — needs reply (amber)
        'card-needs-reply':
          'rgb(var(--color-card-needs-reply) / <alpha-value>)',
        'card-needs-reply-pill':
          'rgb(var(--color-card-needs-reply-pill) / <alpha-value>)',

        // Feed cards — PR review (blue)
        'card-pr-review':
          'rgb(var(--color-card-pr-review) / <alpha-value>)',
        'card-pr-review-pill':
          'rgb(var(--color-card-pr-review-pill) / <alpha-value>)',

        // Feed cards — PR ready to merge (green)
        'card-pr-ready-to-merge':
          'rgb(var(--color-card-pr-ready-to-merge) / <alpha-value>)',
        'card-pr-ready-to-merge-pill':
          'rgb(var(--color-card-pr-ready-to-merge-pill) / <alpha-value>)',

        // Feed cards — goal (violet), idle (neutral)
        'card-goal': 'rgb(var(--color-card-goal) / <alpha-value>)',
        'card-idle': 'rgb(var(--color-card-idle) / <alpha-value>)',
        'card-idle-pill': 'rgb(var(--color-card-idle-pill) / <alpha-value>)',
      },

      // BORDER RADIUS
      borderRadius: {
        chip: '4px',
        DEFAULT: '8px',
        btn: '10px',
        panel: '12px',
        card: '16px',
        pill: '999px',
      },

      // FONT SIZE
      // Named scale so you use text-page-title, text-card-title etc.
      fontSize: {
        'page-title': ['28px', { lineHeight: '34px', fontWeight: '500' }],
        'section-head': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'card-title': ['19px', { lineHeight: '24px', fontWeight: '500' }],
        body: ['15px', { lineHeight: '22px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        label: ['11px', { lineHeight: '16px', fontWeight: '500' }],
        overline: [
          '10px',
          { lineHeight: '14px', fontWeight: '500', letterSpacing: '0.08em' },
        ],
        micro: ['9px', { lineHeight: '13px' }],
      },

      // LETTER SPACING
      letterSpacing: {
        overline: '0.08em',
        label: '0.05em',
      },

      // SPACING
      // Extend (not replace) the default Tailwind spacing scale
      spacing: {
        18: '72px',
        22: '88px',
      },
    },
  },

  plugins: [
    // Inject all CSS custom properties at :root
    // RGB triplets (no #) required for the / <alpha-value> syntax
    ({ addBase }) =>
      addBase({
        ':root': {
          // Light mode (default)
          // Surfaces
          '--color-bg': '245 239 230', // #F5EFE6  sand page bg
          '--color-surface': '255 250 247', // #FFFAF7  card / sheet bg
          '--color-border': '237 216 200', // #EDD8C8  dividers, borders

          // Accent — coral
          '--color-accent': '216 90 48', // #D85A30  primary CTA, active nav
          '--color-accent-lt': '253 232 223', // #FDE8DF  badge fills, tinted surfaces
          '--color-accent-dk': '153 60 29', // #993C1D  text on accent-lt, hover

          // Text
          '--color-text-primary': '44 24 16', // #2C1810  headings, body copy
          '--color-text-muted': '154 106 85', // #9A6A55  secondary labels, captions
          '--color-text-hint': '196 160 144', // #C4A090  placeholders, disabled

          // Semantic — success (green)
          '--color-success': '99 153 34', // #639922
          '--color-success-lt': '234 243 222', // #EAF3DE
          '--color-success-dk': '59 109 17', // #3B6D11

          // Semantic — danger (red)
          '--color-danger': '217 53 53', // #D93535
          '--color-danger-lt': '252 235 235', // #FCEBEB
          '--color-danger-dk': '163 45 45', // #A32D2D

          // Semantic — info (blue)
          '--color-info': '55 138 221', // #378ADD
          '--color-info-lt': '230 241 251', // #E6F1FB
          '--color-info-dk': '24 95 165', // #185FA5

          // Semantic — warning (amber)
          '--color-warning': '212 146 10', // #D4920A
          '--color-warning-lt': '254 244 224', // #FEF4E0
          '--color-warning-dk': '138 90 0', // #8A5A00

          // Card semantics — teal (meeting), violet (goal)
          '--color-teal': '29 158 117', // #1D9E75  pill dot
          '--color-teal-dk': '15 110 86', // #0F6E56  pill text
          '--color-violet': '127 119 221', // #7F77DD
          '--color-violet-dk': '83 74 183', // #534AB7

          // Feed cards — issue (coral)
          '--color-card-issue': '253 232 223', // #FDE8DF  bg
          '--color-card-issue-pill': '240 210 198', // #F0D2C6  pill bg

          // Feed cards — meeting (teal)
          '--color-card-meeting': '225 245 238', // #E1F5EE  bg
          '--color-card-meeting-pill': '198 227 218', // #C6E3DA  pill bg

          // Feed cards — needs reply (amber)
          '--color-card-needs-reply': '254 244 224', // #FEF4E0  bg
          '--color-card-needs-reply-pill': '239 224 195', // #EFE0C3  pill bg

          // Feed cards — PR review (blue)
          '--color-card-pr-review': '230 241 251', // #E6F1FB  bg
          '--color-card-pr-review-pill': '205 222 240', // #CDDEF0  pill bg

          // Feed cards — PR ready to merge (green)
          '--color-card-pr-ready-to-merge': '234 243 222', // #EAF3DE  bg
          '--color-card-pr-ready-to-merge-pill': '211 226 195', // #D3E2C3  pill bg

          // Feed cards — goal (violet), idle (neutral)
          '--color-card-goal': '238 237 254', // #EEEDFE
          '--color-card-idle': '245 239 230', // #F5EFE6  bg (= page bg)
          '--color-card-idle-pill': '237 216 200', // #EDD8C8  pill bg (= border)
        },

        // Dark mode overrides
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            // Surfaces
            '--color-bg': '13 13 13', // #0D0D0D
            '--color-surface': '22 22 22', // #161616
            '--color-border': '40 34 30', // #28221E

            // Accent — lighter coral for dark bg readability
            '--color-accent': '240 153 123', // #F0997B  coral-200
            '--color-accent-lt': '113 43 19', // #712B13  coral-800
            '--color-accent-dk': '245 196 179', // #F5C4B3  coral-100

            // Text
            '--color-text-primary': '245 239 230', // #F5EFE6
            '--color-text-muted': '154 106 85', // #9A6A55  same — warm enough on dark
            '--color-text-hint': '90 58 42', // #5A3A2A

            // Success
            '--color-success-lt': '42 82 9', // #2A5209  green-800
            '--color-success-dk': '200 224 176', // #C8E0B0  green-100

            // Danger
            '--color-danger-lt': '107 16 16', // #6B1010  red-800
            '--color-danger-dk': '245 192 192', // #F5C0C0  red-100

            // Info
            '--color-info-lt': '12 62 122', // #0C3E7A  blue-800
            '--color-info-dk': '192 216 245', // #C0D8F5  blue-100

            // Warning
            '--color-warning-lt': '106 66 0', // #6A4200  amber-800
            '--color-warning-dk': '245 223 160', // #F5DFA0  amber-100

            // Card semantics — teal, violet
            '--color-teal-dk': '159 225 203', // #9FE1CB  pill text
            '--color-violet-dk': '206 203 246', // #CECBF6

            // Feed cards — issue (coral)
            '--color-card-issue': '28 21 16', // #1C1510  bg
            '--color-card-issue-pill': '56 44 37', // #382C25  pill bg

            // Feed cards — meeting (teal)
            '--color-card-meeting': '13 26 20', // #0D1A14  bg
            '--color-card-meeting-pill': '32 52 44', // #20342C  pill bg

            // Feed cards — needs reply (amber)
            '--color-card-needs-reply': '26 22 8', // #1A1608  bg
            '--color-card-needs-reply-pill': '54 48 28', // #36301C  pill bg

            // Feed cards — PR review (blue)
            '--color-card-pr-review': '15 21 32', // #0F1520  bg
            '--color-card-pr-review-pill': '38 46 60', // #262E3C  pill bg

            // Feed cards — PR ready to merge (green)
            '--color-card-pr-ready-to-merge': '15 28 20', // #0F1C14  bg
            '--color-card-pr-ready-to-merge-pill': '39 53 40', // #273528  pill bg

            // Feed cards — goal (violet), idle (neutral)
            '--color-card-goal': '26 21 32', // #1A1520
            '--color-card-idle': '22 22 22', // #161616  bg (= surface)
            '--color-card-idle-pill': '40 34 30', // #28221E  pill bg (= border)
          },
        },
      }),
  ],
};
