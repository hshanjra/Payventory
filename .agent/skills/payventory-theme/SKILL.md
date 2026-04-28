---
name: payventory-theme
description: How to use design tokens and Tailwind CSS in the Payventory POS app. Load this whenever working on any UI component — colors, borders, shadows, backgrounds.
version: 1.0.0
---

# Payventory Theme System

## Single Source of Truth

All design tokens live in `src/theme/tokens.js` (CommonJS so Tailwind can `require()` it).
TypeScript types are in `src/theme/tokens.d.ts`.
The `useTheme()` hook is the only way components should access colors at runtime.

```ts
import { useTheme } from '@/theme/useTheme';

const { colors, isDark } = useTheme();
```

---

## Tailwind Class Convention

Light (default) classes use the token name directly.
Dark classes append `-d` to the token name.

| Token        | Light class          | Dark class               |
|--------------|----------------------|--------------------------|
| canvas       | `bg-canvas`          | `dark:bg-canvas-d`       |
| surface      | `bg-surface`         | `dark:bg-surface-d`      |
| surface-el   | `bg-surface-el`      | `dark:bg-surface-el-d`   |
| primary      | `bg-primary`         | `dark:bg-primary-d`      |
| primary-fg   | `text-primary-fg`    | `dark:text-primary-fg-d` |
| foreground   | `text-foreground`    | `dark:text-foreground-d` |
| fg-secondary | `text-fg-secondary`  | `dark:text-fg-secondary-d` |
| fg-muted     | `text-fg-muted`      | `dark:text-fg-muted-d`   |
| border       | `border-border`      | `dark:border-border-d`   |
| border-strong| `border-border-strong` | `dark:border-border-strong-d` |
| muted        | `bg-muted`           | `dark:bg-muted-d`        |
| muted-fg     | `text-muted-fg`      | `dark:text-muted-fg-d`   |
| error        | `text-error`         | `dark:text-error-d`      |
| error-bg     | `bg-error-bg`        | `dark:bg-error-bg-d`     |
| success      | `text-success`       | `dark:text-success-d`    |
| warning      | `text-warning`       | `dark:text-warning-d`    |
| accent       | `text-accent`        | `dark:text-accent-d`     |

---

## Rules: When to Use Tailwind vs `style={}`

### Use Tailwind classes for:
- Layout (`flex`, `flex-row`, `items-center`, `gap-*`, `px-*`, `rounded-*`)
- Static sizing (`w-16`, `h-14`)
- Typography weight/size/tracking (`text-[15px]`, `font-semibold`, `tracking-wide`)
- Static theme colors that don't change per-item (`bg-primary`, `text-white`, `text-foreground`)

```tsx
<Text className="text-[15px] font-semibold text-foreground dark:text-foreground-d">
  Hello
</Text>
```

### Use `style={{ color: colors.X }}` for:
- **Colors that depend on state** (e.g. focused border, selected item, active tab)
- **Colors used as `placeholderTextColor`** prop (Tailwind can't drive this prop)
- **Opacity variants** — use the hex-alpha pattern: `colors.primary + '1e'` (12% opacity)
- **Animation values** (`Animated.Value`, transforms)
- **`boxShadow`** — always inline since shadow color comes from tokens

```tsx
// ✅ Correct — dynamic border that changes on focus
<TextInput
  className="border-[1.5px] rounded-xl px-4"
  style={{ borderColor: focused ? colors.primary : colors.border, color: colors.foreground }}
  placeholderTextColor={colors.fgMuted}
/>

// ✅ Correct — icon color driven by token
<MaterialIcons name="search" size={22} color={colors.icon} />

// ❌ Wrong — hardcoded hex
<Text style={{ color: '#475569' }}>...</Text>

// ❌ Wrong — using Tailwind for a value that changes per state
<View className="border-primary" /> {/* won't react dynamically */}
```

---

## Opacity Hex-Alpha Pattern

Append a 2-digit hex alpha to `colors.*` for semi-transparent fills and borders.

| Opacity | Hex suffix | Example                         |
|---------|------------|---------------------------------|
| 8%      | `14`       | `colors.primary + '14'`         |
| 10%     | `1a`       | `colors.primary + '1a'`         |
| 12%     | `1e`       | `colors.primary + '1e'`         |
| 15%     | `26`       | `colors.primary + '26'`         |
| 13%     | `22`       | `colors.primary + '22'`         |

```tsx
// icon pill background — same pattern used in Header.tsx
const pillBg     = colors.primary + '14';
const pillBorder = colors.primary + '22';

<View style={{ backgroundColor: pillBg, borderColor: pillBorder }}
  className="h-11 w-11 rounded-full border items-center justify-center">
  ...
</View>
```

---

## Box Shadows

Always use `boxShadow` (CSS string, not legacy RN shadow props). Color must come from tokens.

```tsx
// ✅ Correct
style={{ boxShadow: `0 8px 32px ${colors.shadow}40` }}

// Hardcoded variants are acceptable only for the overlay glass:
style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.55)' }}  // dark overlay
style={{ boxShadow: '0 8px 40px rgba(26,86,219,0.1)' }} // primary glow (use sparingly)
```

---

## LinearGradient Colors

Pull from tokens — never hardcode.

```tsx
import { LinearGradient } from 'expo-linear-gradient';

const { colors, isDark } = useTheme();

const gradientColors: [string, string] = isDark
  ? [colors.canvas, '#0d1b35']   // dark: canvas → slightly elevated
  : ['#eef2ff', colors.canvas];  // light: indigo tint → canvas

<LinearGradient colors={gradientColors} className="absolute inset-0" />
```

---

## Complete Component Example

```tsx
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export function MyCard() {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      className="rounded-2xl border p-4 gap-3"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <Text
        className="text-[13px] font-semibold uppercase tracking-wider"
        style={{ color: colors.fgMuted }}
      >
        Label
      </Text>
      <TextInput
        className="h-12 rounded-xl border-[1.5px] px-4 text-[15px]"
        style={{
          backgroundColor: colors.muted,
          borderColor: focused ? colors.primary : colors.border,
          color: colors.foreground,
        }}
        placeholderTextColor={colors.fgMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}
```
