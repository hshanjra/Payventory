---
name: payventory-icons
description: How to use icons in the Payventory POS app. Load this whenever adding any icon to any screen or component — never use emojis as UI icons.
version: 1.0.0
---

# Payventory Icons

## Rule #1 — Never Use Emojis as Icons

Emojis look inconsistent across Android/iOS versions and can't be tinted with theme colors.
**Always** use `@expo/vector-icons` components instead.

---

## Icon Libraries in This Project

Two icon sets are used — pick the right one for the context:

| Library                | Import                                                        | Use for                          |
|------------------------|---------------------------------------------------------------|----------------------------------|
| `MaterialIcons`        | `import { MaterialIcons } from '@expo/vector-icons';`        | **Default** — use for 95% of cases |
| `MaterialCommunityIcons` | `import { MaterialCommunityIcons } from '@expo/vector-icons';` | When MaterialIcons lacks a specific icon |

> Do NOT import `Ionicons`, `FontAwesome`, `AntDesign`, or any other set. Keep the icon vocabulary consistent.

---

## Usage Pattern

```tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

const { colors } = useTheme();

// Standard icon — color always from theme tokens
<MaterialIcons name="search" size={22} color={colors.icon} />

// Primary-tinted icon
<MaterialIcons name="qr-code-scanner" size={22} color={colors.primary} />

// Icon inside a white button
<MaterialIcons name="close" size={24} color={colors.primaryFg} />

// Muted icon
<MaterialIcons name="unfold-more" size={18} color={colors.mutedFg} />
```

**Size guide:**
| Context            | Size |
|--------------------|------|
| Tab bar            | 24   |
| List item / row    | 22   |
| Compact / caption  | 18   |
| Hero / large card  | 32+  |

---

## Color Rule

Icon color **must always** come from `colors.*` (never hardcoded hex).

| Situation                  | Token             |
|----------------------------|-------------------|
| Standard UI icon           | `colors.icon`     |
| Muted / secondary          | `colors.mutedFg`  |
| On primary background      | `colors.primaryFg`|
| Colored / brand action     | `colors.primary`  |
| Destructive / error        | `colors.error`    |
| Success confirmation       | `colors.success`  |

```tsx
// ✅ Correct
<MaterialIcons name="check-circle" size={22} color={colors.success} />

// ❌ Wrong — hardcoded
<MaterialIcons name="check-circle" size={22} color="#059669" />

// ❌ Wrong — emoji used as icon
<Text>✅</Text>
```

---

## Common Icon Name Reference

### Navigation & Actions
| Intent           | Icon name                  |
|------------------|----------------------------|
| Back             | `arrow-back`               |
| Forward / next   | `arrow-forward`            |
| Close / dismiss  | `close`                    |
| Menu             | `menu`                     |
| More options     | `more-vert`                |
| Chevron right    | `chevron-right`            |
| Expand/collapse  | `unfold-more`              |
| Done / confirm   | `check`                    |
| Check circle     | `check-circle`             |

### Authentication & Security
| Intent           | Icon name                  |
|------------------|----------------------------|
| Login / account  | `person-outline`           |
| Lock             | `lock-outline`             |
| Lock open        | `lock-open`                |
| Fingerprint      | `fingerprint`              |
| Visibility on    | `visibility`               |
| Visibility off   | `visibility-off`           |
| Password / key   | `vpn-key`                  |
| Phone / OTP      | `smartphone`               |
| Email            | `email`                    |
| Security shield  | `security`                 |

### POS / Commerce
| Intent           | Icon name                  |
|------------------|----------------------------|
| Home             | `home-filled`              |
| Search           | `search`                   |
| Cart             | `shopping-basket`          |
| Scan / QR        | `qr-code-scanner`          |
| QR code display  | `qr-code-2`                |
| Inventory        | `inventory-2`              |
| Orders / receipt | `receipt-long`             |
| Customers        | `people-alt`               |
| Settings         | `settings`                 |
| Explore          | `explore`                  |
| Camera           | `camera-alt`               |
| Notifications    | `notifications-none`       |
| Favourite        | `favorite-border`          |
| Flash on         | `flash-on`                 |
| Flash off        | `flash-off`                |
| PIN / numpad     | `dialpad`                  |
| Biometric face   | `face`                     |

### Status & Feedback
| Intent           | Icon name                  |
|------------------|----------------------------|
| Error / warning  | `error-outline`            |
| Info             | `info-outline`             |
| Success tick     | `check-circle`             |
| Add / plus       | `add`                      |
| Remove / minus   | `remove`                   |
| Delete           | `delete-outline`           |
| Edit             | `edit`                     |
| Refresh          | `refresh`                  |

---

## Icon in a Pill / Badge Button

Pattern used throughout the app (Header.tsx, SearchBar.tsx):

```tsx
const pillBg     = colors.primary + '14';
const pillBorder = colors.primary + '22';

<Pressable
  className="h-11 w-11 rounded-full border items-center justify-center"
  style={{ backgroundColor: pillBg, borderColor: pillBorder }}
>
  <MaterialIcons name="notifications-none" size={23} color={colors.icon} />
</Pressable>
```

## Icon in a Square Card / Method Tile

```tsx
<View
  className="h-12 w-12 rounded-[14px] items-center justify-center"
  style={{ backgroundColor: colors.primary + '26' }}
>
  <MaterialIcons name="dialpad" size={24} color={colors.primary} />
</View>
```

## Tab Bar Icon

```tsx
tabBarIcon: ({ color }) => <MaterialIcons name="home-filled" size={24} color={color} />,
```

---

## MaterialCommunityIcons — When to Use

Only when `MaterialIcons` doesn't have what you need. Example:

```tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Used in CategoryTabs for category-specific icons
<MaterialCommunityIcons name="food" size={20} color={colors.icon} />
```

Common names in this project: `food`, `tshirt-crew`, `cellphone`, `laptop`, `cube-outline`.
