/**
 * tailwind.config.js
 *
 * Color values come from src/theme/tokens.js — the single source of truth.
 *
 * Convention for dark-mode Tailwind classes:
 *   Light (default) → bg-canvas, text-foreground, border-border …
 *   Dark variant    → dark:bg-canvas-d, dark:text-foreground-d …
 *
 * All dark variant class names end in `-d`.
 */

const { light, dark } = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Light (default) ───────────────────────────────────────────
        canvas:         light.canvas,
        surface:        light.surface,
        'surface-el':   light.surfaceEl,
        primary:        light.primary,
        'primary-fg':   light.primaryFg,
        foreground:     light.foreground,
        'fg-secondary': light.fgSecondary,
        'fg-muted':     light.fgMuted,
        icon:           light.icon,
        border:         light.border,
        'border-strong':light.borderStrong,
        muted:          light.muted,
        'muted-fg':     light.mutedFg,
        success:        light.success,
        'success-bg':   light.successBg,
        warning:        light.warning,
        'warning-bg':   light.warningBg,
        error:          light.error,
        'error-bg':     light.errorBg,

        // ── Dark variants (suffix -d) ──────────────────────────────────
        'canvas-d':         dark.canvas,
        'surface-d':        dark.surface,
        'surface-el-d':     dark.surfaceEl,
        'primary-d':        dark.primary,
        'primary-fg-d':     dark.primaryFg,
        'foreground-d':     dark.foreground,
        'fg-secondary-d':   dark.fgSecondary,
        'fg-muted-d':       dark.fgMuted,
        'icon-d':           dark.icon,
        'border-d':         dark.border,
        'border-strong-d':  dark.borderStrong,
        'muted-d':          dark.muted,
        'muted-fg-d':       dark.mutedFg,
        'success-d':        dark.success,
        'success-bg-d':     dark.successBg,
        'warning-d':        dark.warning,
        'warning-bg-d':     dark.warningBg,
        'error-d':          dark.error,
        'error-bg-d':       dark.errorBg,
      },
      fontFamily: {
        inter: ['Inter'],
        mono: ['SpaceMono'],
      },
      fontSize: {
        h1: ['32px', { fontWeight: '700', letterSpacing: '-0.5px' }],
        h2: ['24px', { fontWeight: '600', letterSpacing: '-0.3px' }],
        body: ['16px', { fontWeight: '400' }],
        caption: ['12px', { fontWeight: '500' }],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
