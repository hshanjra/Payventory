import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Medusa from '@medusajs/js-sdk';
import * as SecureStore from 'expo-secure-store';
import { clearPosDefaultsFromStore } from '@/lib/pos-defaults-storage';
import * as LocalAuthentication from 'expo-local-authentication';

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

          await SecureStore.setItemAsync('medusaUrl', BASE_URL!);
          await SecureStore.setItemAsync('userEmail', email);
          await SecureStore.setItemAsync('apiKey', apiKey);

          const appLockMethod = await SecureStore.getItemAsync('appLockMethod');
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
      throw new Error('User is not authenticated');
    }

    await SecureStore.deleteItemAsync('apiKey');
    await SecureStore.deleteItemAsync('appPin');
    await SecureStore.deleteItemAsync('appLockMethod');
    await clearPosDefaultsFromStore();
    setState({ status: 'unauthenticated' });
  }, [state.status]);

  const setupAppLock = useCallback(async () => {
    if (state.status !== 'authenticated') return;

    await SecureStore.setItemAsync('appLockMethod', 'local');

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

    await SecureStore.deleteItemAsync('appLockMethod');
    await SecureStore.deleteItemAsync('appPin');

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

    const method = await SecureStore.getItemAsync('appLockMethod');

    if (method === 'local') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Payventory',
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
        const medusaUrl = await SecureStore.getItemAsync('medusaUrl');
        const userEmail = await SecureStore.getItemAsync('userEmail');
        const apiKey = await SecureStore.getItemAsync('apiKey');

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

          const appLockMethod = await SecureStore.getItemAsync('appLockMethod');
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

          await SecureStore.deleteItemAsync('apiKey');

          setState({
            status: 'unauthenticated',
            userEmail: userEmail ?? undefined,
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        await SecureStore.deleteItemAsync('apiKey');

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
