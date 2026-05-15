import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Medusa from '@medusajs/js-sdk';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { clearPosDefaultsFromStore } from '@/lib/pos-defaults-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { SECURE_STORE_KEYS } from '@/lib/secure-store-keys';
import { useQueryClient } from '@tanstack/react-query';

export type AuthStateType =
  | {
      status: 'loading';
    }
  | {
      status: 'unauthenticated';
      userEmail?: string;
    }
  | {
      status: 'authenticated';
      user: {
        id: string;
        name: string;
        email: string;
      };
      userEmail: string;
      apiKey: string;
      isAppLocked: boolean;
      hasAppLockSetup: boolean;
    };

export type AuthContextType = {
  state: AuthStateType;
  login: (email: string, strategy: 'emailpass' | 'otp', password: string) => Promise<void>;
  resentOtp: (email: string) => Promise<void>;
  validateOtp: (email: string, otp: string | number) => Promise<void>;
  logout: () => Promise<void>;
  setupAppLock: () => Promise<void>;
  disableAppLock: () => Promise<void>;
  unlockApp: () => Promise<boolean>;
};

const BASE_URL = process.env.EXPO_PUBLIC_MEDUSA_URL!;

export const AuthContext = createContext<AuthContextType>({
  state: { status: 'loading' },
  login: async () => {
    throw new Error('login function not implemented');
  },
  resentOtp: async () => {
    throw new Error('resentOtp function not implemented');
  },
  validateOtp: async () => {
    throw new Error('validateOtp function not implemented');
  },
  logout: async () => {
    throw new Error('logout function not implemented');
  },
  setupAppLock: async () => {
    throw new Error('setupAppLock function not implemented');
  },
  disableAppLock: async () => {
    throw new Error('disableAppLock function not implemented');
  },
  unlockApp: async () => {
    throw new Error('unlockApp function not implemented');
  },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthStateType>({ status: 'loading' });

  const queryClient = useQueryClient();

  const login = useCallback(
    async (email: string, strategy: 'emailpass' | 'otp', password: string | number) => {
      try {
        const sdk = new Medusa({
          baseUrl: BASE_URL,
          debug: false,
          auth: {
            type: 'jwt',
            jwtTokenStorageMethod: 'nostore',
          },
        });

        if (strategy === 'emailpass') {
          const loginResponse = await sdk.auth.login('user', 'emailpass', {
            email,
            password: password,
          });

          if (typeof loginResponse !== 'string') {
            throw new Error('Handle this redirect later');
          }

          const apiKey = loginResponse;

          const userResponse = await sdk.admin.user.me(undefined, {
            Authorization: `Bearer ${apiKey}`,
          });

          await SecureStore.setItemAsync(SECURE_STORE_KEYS.MEDUSA_URL, BASE_URL!);
          await SecureStore.setItemAsync(SECURE_STORE_KEYS.USER_EMAIL, email);
          await SecureStore.setItemAsync(SECURE_STORE_KEYS.API_KEY, apiKey);

          const appLockMethod = await SecureStore.getItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD);
          const hasAppLockSetup = !!appLockMethod;

          setState({
            status: 'authenticated',
            user: {
              id: userResponse.user.id,
              name: `${userResponse.user.first_name} ${userResponse.user.last_name}`,
              email: userResponse.user.email,
            },
            userEmail: email,
            apiKey,
            hasAppLockSetup,
            isAppLocked: hasAppLockSetup,
          });
        } else if (strategy === 'otp') {
          throw new Error('OTP Login not implemented yet');
        }
      } catch (error) {
        console.log('Failed to login', error);
        throw error;
      }
    },
    []
  );
  const logout = useCallback(async () => {
    if (state.status !== 'authenticated') {
      return;
    }

    const confirmed = await new Promise((resolve) => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout? This will clear your session and discard any active draft order.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Logout', style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });

    if (!confirmed) return;

    try {
      const draftOrderId = await SecureStore.getItemAsync(SECURE_STORE_KEYS.DRAFT_ORDER_ID);
      if (draftOrderId) {
        const sdk = new Medusa({
          baseUrl: BASE_URL,
          debug: false,
          auth: {
            type: 'jwt',
            jwtTokenStorageMethod: 'custom',
            storage: {
              getItem: () => state.apiKey,
              setItem: () => {},
              removeItem: () => {},
            },
          },
        });

        const { draft_order } = await sdk.admin.draftOrder.retrieve(draftOrderId);
        if (draft_order.items && draft_order.items.length > 0) {
          await sdk.admin.draftOrder.delete(draftOrderId);
        }
      }
    } catch (error) {
      console.warn('Logout: Could not discard draft order', error);
    }

    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.API_KEY);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.APP_PIN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.DRAFT_ORDER_ID);
    await clearPosDefaultsFromStore();

    queryClient.clear();
    setState({ status: 'unauthenticated' });
  }, [state, queryClient]);

  const setupAppLock = useCallback(async () => {
    if (state.status !== 'authenticated') return;

    await SecureStore.setItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD, 'local');

    setState(
      (prev) =>
        ({
          ...prev,
          status: 'authenticated',
          hasAppLockSetup: true,
          isAppLocked: false,
        }) as AuthStateType
    );
  }, [state.status]);

  const disableAppLock = useCallback(async () => {
    if (state.status !== 'authenticated') return;

    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.APP_PIN);

    setState(
      (prev) =>
        ({
          ...prev,
          status: 'authenticated',
          hasAppLockSetup: false,
          isAppLocked: false,
        }) as AuthStateType
    );
  }, [state.status]);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    if (state.status !== 'authenticated') return false;

    const method = await SecureStore.getItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD);

    if (method === 'local') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Divya Jyoti Foundation',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false, // Ensure we allow PIN/Pattern fallback
      });
      if (result.success) {
        setState((prev) => ({ ...prev, isAppLocked: false }) as AuthStateType);
        return true;
      }
      return false;
    }

    return false;
  }, [state.status]);

  const resentOtp = useCallback(async (email: string) => {}, []);
  const validateOtp = useCallback(async (email: string, otp: string | number) => {
    // Implement actual OTP validation logic with Medusa here
    // For now, it's a stub that should probably set authenticated state
    throw new Error('OTP Validation not implemented in Medusa yet');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      try {
        const medusaUrl = await SecureStore.getItemAsync(SECURE_STORE_KEYS.MEDUSA_URL);
        const userEmail = await SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_EMAIL);
        const apiKey = await SecureStore.getItemAsync(SECURE_STORE_KEYS.API_KEY);

        if (cancelled) {
          return;
        }

        if (medusaUrl && apiKey) {
          const sdk = new Medusa({
            baseUrl: medusaUrl,
            debug: false,
            auth: {
              type: 'jwt',
              jwtTokenStorageMethod: 'custom',
              storage: {
                getItem: () => apiKey,
                setItem: () => {},
                removeItem: () => {},
              },
            },
          });

          if (cancelled) {
            return;
          }

          const userResponse = await sdk.admin.user.me();

          if (cancelled) {
            return;
          }

          const appLockMethod = await SecureStore.getItemAsync(SECURE_STORE_KEYS.APP_LOCK_METHOD);
          const hasAppLockSetup = !!appLockMethod;

          setState({
            status: 'authenticated',
            user: {
              id: userResponse.user.id,
              name:
                [userResponse.user.first_name, userResponse.user.last_name]
                  .filter(Boolean)
                  .join(' ') || userResponse.user.email.split('@')[0],
              email: userResponse.user.email,
            },
            userEmail: userResponse.user.email,
            apiKey,
            hasAppLockSetup,
            isAppLocked: hasAppLockSetup,
          });
        } else {
          if (cancelled) {
            return;
          }

          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.API_KEY);

          setState({
            status: 'unauthenticated',
            userEmail: userEmail ?? undefined,
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.API_KEY);

        // if (isUnauthorizedError(error)) {
        //   Toast.show({
        //     type: 'error',
        //     text1: 'Session Expired',
        //     text2: 'Your session has expired. Please log in again.',
        //     visibilityTime: 4000,
        //   });
        // } else {
        //   console.error('Failed to load auth state:', error);
        //   Toast.show({
        //     type: 'error',
        //     text1: 'Authentication Error',
        //     text2: 'Failed to load authentication state. Please try again.',
        //     visibilityTime: 4000,
        //   });
        // }

        setState({ status: 'unauthenticated' });
      }
    };

    loadAuthState();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        resentOtp,
        validateOtp,
        setupAppLock,
        disableAppLock,
        unlockApp,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthCtx = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthCtx must be used within AuthProvider');
  }
  return ctx;
};

export const useAuthenticated = () => {
  const { state } = useAuthCtx();

  if (state.status !== 'authenticated') {
    throw new Error('User is not authenticated');
  }

  return state;
};

export const useMedusaSdk = (): Medusa => {
  const { state } = useAuthCtx();

  if (state.status !== 'authenticated') {
    throw new Error('User is not authenticated');
  }

  return useMemo(
    () =>
      new Medusa({
        baseUrl: BASE_URL,
        debug: false,
        auth: {
          type: 'jwt',
          jwtTokenStorageMethod: 'custom',
          storage: {
            getItem: () => state.apiKey,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }),
    [BASE_URL, state.apiKey]
  );
};
