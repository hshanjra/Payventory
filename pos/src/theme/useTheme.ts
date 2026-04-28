import { useColorScheme } from 'nativewind';
import { light, dark } from './tokens';
import type { ThemeColors } from './tokens';

export type { ThemeColors };
export { light, dark };

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

/**
 * Returns the active theme palette and a convenience `isDark` flag.
 *
 * Use `colors.*` for JS props that can't be driven by Tailwind classes
 * (e.g. icon color, shadow color, inline style objects).
 *
 * For everything else prefer the named Tailwind classes:
 *   Light → bg-canvas, text-foreground, border-border …
 *   Dark  → dark:bg-canvas-d, dark:text-foreground-d, dark:border-border-d …
 */
export function useTheme(): Theme {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
