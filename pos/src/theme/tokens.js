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
  canvas:   '#F8FAFC',   // slate-50 (clean, airy)
  surface:  '#FFFFFF',   // pure white for cards
  surfaceEl:'#FFFFFF',   // elevated surfaces

  // ── Primary (Amber Brand) ──────────────────────────────────────────
  primary:  '#D97706',   // amber-600 (rich amber)
  primaryFg:'#FFFFFF',

  // ── Text ─────────────────────────────────────────────────────────
  foreground: '#0F172A', // slate-900 (deep navy-grey)
  fgSecondary:'#475569', // slate-600
  fgMuted:    '#94A3B8', // slate-400

  // ── Icons ─────────────────────────────────────────────────────────
  icon:     '#1E293B',   // slate-800

  // ── Borders / Dividers ────────────────────────────────────────────
  border:   '#E2E8F0',   // slate-200
  borderStrong:'#CBD5E1',// slate-300

  // ── Muted fills ───────────────────────────────────────────────────
  muted:    '#F1F5F9',   // slate-100
  mutedFg:  '#64748B',   // slate-500

  // ── Semantic states ───────────────────────────────────────────────
  success:  '#059669',
  successBg:'#ECFDF5',
  warning:  '#D97706',
  warningBg:'#FFFBEB',
  error:    '#475569',   // slate-600 (neutral error/secondary)
  errorBg:  '#F1F5F9',   // slate-100

  // ── Accent (Neutral/Amber) ──────────────────────────────────
  accent:   '#94A3B8',   // slate-400
  accentGold: '#D97706', // amber-600

  // ── Tab bar ───────────────────────────────────────────────────────
  tabBarBg:    '#FFFFFF',
  tabBorder:   '#E2E8F0',
  activeTint:  '#D97706', // amber-600
  inactiveTint:'#94A3B8',

  // ── Floating elements ──────────────────────────────────────────────
  cartBg:    '#0F172A',
  cartBorder:'#1E293B',
  shadow:    '#0F172A',
};

const dark = {
  // ── Backgrounds ──────────────────────────────────────────────────
  canvas:   '#0F172A',   // slate-900
  surface:  '#1E293B',   // slate-800
  surfaceEl:'#334155',   // slate-700

  // ── Primary (Amber Brand) ─────────────────────────────────────────
  primary:  '#FBBF24',   // amber-400 (glows on dark)
  primaryFg:'#1E293B',   // dark slate for contrast

  // ── Text ─────────────────────────────────────────────────────────
  foreground: '#F8FAFC', // slate-50
  fgSecondary:'#CBD5E1', // slate-300
  fgMuted:    '#475569', // slate-600

  // ── Icons ─────────────────────────────────────────────────────────
  icon:     '#CBD5E1',   // slate-300

  // ── Borders ───────────────────────────────────────────────────────
  border:      '#334155', // slate-700
  borderStrong:'#475569', // slate-600

  // ── Muted fills ───────────────────────────────────────────────────
  muted:   '#334155',    // slate-700
  mutedFg: '#64748B',    // slate-500

  // ── Semantic states ───────────────────────────────────────────────
  success:  '#10B981',
  successBg: '#064E3B',
  warning:  '#FBBF24',
  warningBg: '#451A03',
  error:    '#94A3B8',   // slate-400 (neutral error/secondary)
  errorBg:  '#1E293B',   // slate-800

  // ── Accent ────────────────────────────────────────────────────────
  accent:   '#60A5FA',   // blue-400
  accentGold: '#FBBF24',

  // ── Tab bar ───────────────────────────────────────────────────────
  tabBarBg:    '#1E293B',
  tabBorder:   '#334155',
  activeTint:  '#FBBF24', // amber-400
  inactiveTint:'#64748B',

  // ── Floating elements ──────────────────────────────────────────────
  cartBg:    '#F8FAFC',
  cartBorder:'#CBD5E1',
  shadow:    '#000000',
};

module.exports = { light, dark };
