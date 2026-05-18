/**
 * SINGLE SOURCE OF TRUTH for all SecureStore keys used in the app.
 * Transitioning to a centralized Zustand store using APP_STATE.
 */
export const SECURE_STORE_KEYS = {
  APP_STATE: 'app-state',
  // Legacy keys - kept for potential migration logic or reference
  MEDUSA_URL: 'medusaUrl',
  USER_EMAIL: 'userEmail',
  API_KEY: 'apiKey',
  APP_PASSCODE: 'appPasscode',
  POS_DEFAULTS: 'posDefaults',
  DRAFT_ORDER_ID: 'draftOrderId',
} as const;

export type SecureStoreKey = (typeof SECURE_STORE_KEYS)[keyof typeof SECURE_STORE_KEYS];
