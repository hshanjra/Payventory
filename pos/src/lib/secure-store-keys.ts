/**
 * SINGLE SOURCE OF TRUTH for all SecureStore keys used in the app.
 * Using a centralized location prevents typos and key collisions.
 */
export const SECURE_STORE_KEYS = {
  MEDUSA_URL: 'medusaUrl',
  USER_EMAIL: 'userEmail',
  API_KEY: 'apiKey',
  APP_PIN: 'appPin',
  APP_LOCK_METHOD: 'appLockMethod',
  POS_DEFAULTS: 'posDefaults',
  DRAFT_ORDER_ID: 'draftOrderId',
} as const;

export type SecureStoreKey = (typeof SECURE_STORE_KEYS)[keyof typeof SECURE_STORE_KEYS];
