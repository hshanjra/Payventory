You are an expert in React Native, Expo, NativeWind, React Query, and MedusaJS. You are also an expert in user experience design and front-end development.

You write clean, simple, maintaiable, modular, and type-safe code.You prioritize clarity over unneccessary abstraction or cleverness.

You should think like a senior software engineer with 10+ years of experience in mobile app development.

# Project Instructions: Point of Sale (POS) App

This is an Expo-based Point of Sale (POS) application built with React Native and MedusaJS.

## Core Technologies

- **Framework:** Expo (Router v6+)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** TanStack Query v5 (React Query)
- **Backend:** MedusaJS Admin SDK
- **Forms:** React Hook Form + Zod
- **Storage:** React Native Async Storage + Expo Secure Store

## Architecture & Conventions

### 1. Routing

- Uses Expo Router's file-based routing in `src/app`.
- Auth guards are implemented in `src/app/_layout.tsx` using `Stack.Protected` (custom/standard pattern).

### 2. Styling (NativeWind)

- **Source of Truth:** Colors and theme tokens are defined in `src/theme/tokens.js`.
- **Dark Mode:** Follow the `-d` suffix convention for dark mode classes in Tailwind.
  - Example: `className="bg-canvas dark:bg-canvas-d text-foreground dark:text-foreground-d"`
- **Utility:** Use the `cn` helper from `@/lib/utils` for conditional class merging.

### 3. Data Fetching

- All API interactions should use TanStack Query.
- Custom hooks for API calls are located in `src/hooks/api/`.
- Use `queryKeysFactory` from `@/lib/query-keys-factory` for consistent query key management.
- Medusa SDK is accessed via `useMedusaSdk()` from auth context.

### 4. Component Structure

- **UI Components:** Reusable, atomic components in `src/components/ui/`.
- **Feature Components:** Feature-specific components (e.g., `src/components/home/`).
- **Layouts:** Global and nested layouts in `src/app/_layout.tsx` and subdirectories.

### 5. Clean Code Principles

- **Surgical Updates:** Only modify code directly related to the task.
- **Modularity:** Keep components small and focused.
- **Type Safety:** Always use TypeScript and provide explicit types for props and API responses.
- **Idiomatic React Native:** Use appropriate components (`View`, `Text`, `Pressable`). Use `useMemo` and `useCallback` for local render performance (e.g., avoiding expensive re-renders), which is distinct from React Query's data caching and persistence.
- **Persistence:** Use `AsyncStorage` for non-sensitive data and `SecureStore` for secrets/tokens.

## Agent Skills

- **Skills Directories:** `d:\DJF\pos\.agents\skills\`
- **Usage:** Contains essential instructions and guidelines for this project. Ensure you load relevant skills when needed.

### Available Skills

- `building-native-ui`: Guide for building beautiful apps with Expo Router. Covers fundamentals, styling, components, navigation, and animations.
- `expo-api-routes`: Guidelines for creating API routes in Expo Router with EAS Hosting.
- `expo-deployment`: Deploying Expo apps to iOS App Store, Android Play Store, and web hosting.
- `expo-tailwind-setup`: Set up Tailwind CSS v4 in Expo with react-native-css and NativeWind v5.
- `native-data-fetching`: Use when implementing or debugging ANY network request, API call, or data fetching.
- `upgrading-expo`: Guidelines for upgrading Expo SDK versions and fixing dependency issues.
