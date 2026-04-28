/**
 * SINGLE SOURCE OF TRUTH for all design tokens.
 *
 * CommonJS format so tailwind.config.js can require() it directly.
 * TypeScript components import via the .d.ts declaration file.
 *
 * Naming convention in Tailwind:
 *   Light → bg-canvas, text-foreground, border-border, etc.
 *   Dark  → dark:bg-canvas-d, dark:text-foreground-d, etc.
 */

const light = {
  // ── Backgrounds ──────────────────────────────────────────────────
  canvas:   '#f0f4f8',   // page background (warm off-white)
  surface:  '#ffffff',   // card / sheet surface
  surfaceEl:'#ffffff',   // elevated surface (popovers, modals)

  // ── Primary (Financial Blue) ──────────────────────────────────────
  primary:  '#1a56db',
  primaryFg:'#ffffff',

  // ── Text ─────────────────────────────────────────────────────────
  foreground: '#0d1b2a',
  fgSecondary:'#475569',
  fgMuted:    '#94a3b8',

  // ── Icons ─────────────────────────────────────────────────────────
  icon:     '#1e3a5f',   // deep navy

  // ── Borders / Dividers ────────────────────────────────────────────
  border:   '#dde3ec',
  borderStrong:'#c7d2de',

  // ── Muted fills ───────────────────────────────────────────────────
  muted:    '#eef2f7',
  mutedFg:  '#64748b',

  // ── Semantic states ───────────────────────────────────────────────
  success:  '#059669',
  successBg:'#d1fae5',
  warning:  '#d97706',
  warningBg:'#fef3c7',
  error:    '#e02d3c',
  errorBg:  '#fee2e2',

  // ── Accent ────────────────────────────────────────────────────────
  accent:   '#0ea5e9',   // sky-500

  // ── Tab bar ───────────────────────────────────────────────────────
  tabBarBg:    '#ffffff',
  tabBorder:   '#e2e8f0',
  activeTint:  '#1a56db',
  inactiveTint:'#94a3b8',

  // ── Floating cart ─────────────────────────────────────────────────
  cartBg:    '#ffffff',
  cartBorder:'#dde3ec',
  shadow:    '#1a56db',
};

const dark = {
  // ── Backgrounds ──────────────────────────────────────────────────
  canvas:   '#020617',   // slate-950
  surface:  '#0f172a',   // slate-900
  surfaceEl:'#1e293b',   // slate-800

  // ── Primary ───────────────────────────────────────────────────────
  primary:  '#3b82f6',   // blue-500 (brighter on dark)
  primaryFg:'#ffffff',

  // ── Text ─────────────────────────────────────────────────────────
  foreground: '#f0f4f8',
  fgSecondary:'#94a3b8',
  fgMuted:    '#475569',

  // ── Icons ─────────────────────────────────────────────────────────
  icon:     '#93c5fd',   // blue-300

  // ── Borders ───────────────────────────────────────────────────────
  border:      '#1e293b',
  borderStrong:'#334155',

  // ── Muted fills ───────────────────────────────────────────────────
  muted:   '#1e293b',
  mutedFg: '#64748b',

  // ── Semantic states ───────────────────────────────────────────────
  success:  '#10b981',
  successBg:'#064e3b',
  warning:  '#fbbf24',
  warningBg:'#451a03',
  error:    '#f87171',
  errorBg:  '#450a0a',

  // ── Accent ────────────────────────────────────────────────────────
  accent:   '#38bdf8',   // sky-400

  // ── Tab bar ───────────────────────────────────────────────────────
  tabBarBg:    '#0f172a',
  tabBorder:   '#1e293b',
  activeTint:  '#60a5fa',  // blue-400
  inactiveTint:'#475569',

  // ── Floating cart ─────────────────────────────────────────────────
  cartBg:    '#1e293b',
  cartBorder:'#334155',
  shadow:    '#000000',
};

module.exports = { light, dark };
