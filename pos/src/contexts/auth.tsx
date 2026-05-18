import { createContext, useCallback, useContext, useMemo } from 'react';

import Medusa from '@medusajs/js-sdk';
import * as LocalAuthentication from 'expo-local-authentication';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore, User } from '@/store/use-app-store';

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
      user: User;
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

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const state = useMemo((): AuthStateType => {
    if (store.status === 'loading') return { status: 'loading' };
    if (store.status === 'unauthenticated') return { status: 'unauthenticated', userEmail: store.userEmail ?? undefined };
    return {
      status: 'authenticated',
      user: store.user!,
      userEmail: store.userEmail!,
      apiKey: store.apiKey!,
      isAppLocked: store.isAppLocked,
      hasAppLockSetup: store.hasAppLockSetup,
    };
  }, [store.status, store.user, store.userEmail, store.apiKey, store.isAppLocked, store.hasAppLockSetup]);

  const login = useCallback(
    async (email: string, strategy: 'emailpass' | 'otp', password: string | number) => {
      try {
        const medusaUrl = store.medusaUrl || process.env.EXPO_PUBLIC_MEDUSA_URL!;
        const sdk = new Medusa({
          baseUrl: medusaUrl,
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

          const user = {
            id: userResponse.user.id,
            name: `${userResponse.user.first_name} ${userResponse.user.last_name}`,
            email: userResponse.user.email,
          };

          // Update store - persistence is handled automatically
          store.login(user, apiKey, email, store.hasAppLockSetup);
          store.setMedusaUrl(medusaUrl);

        } else if (strategy === 'otp') {
          throw new Error('OTP Login not implemented yet');
        }
      } catch (error) {
        console.log('Failed to login', error);
        throw error;
      }
    },
    [store.medusaUrl, store.hasAppLockSetup, store.login, store.setMedusaUrl]
  );

  const logout = useCallback(async () => {
    if (store.status !== 'authenticated' || !store.apiKey) {
      return;
    }

    try {
      if (store.draftOrderId) {
        const sdk = new Medusa({
          baseUrl: store.medusaUrl!,
          debug: false,
          auth: {
            type: 'jwt',
            jwtTokenStorageMethod: 'custom',
            storage: {
              getItem: () => store.apiKey!,
              setItem: () => {},
              removeItem: () => {},
            },
          },
        });

        const { draft_order } = await sdk.admin.draftOrder.retrieve(store.draftOrderId);
        if (draft_order.items && draft_order.items.length > 0) {
          await sdk.admin.draftOrder.delete(store.draftOrderId);
        }
      }
    } catch (error) {
      console.warn('Logout: Could not discard draft order', error);
    }

    store.logout();

    queryClient.clear();
  }, [store.status, store.apiKey, store.draftOrderId, store.medusaUrl, store.logout, queryClient]);

  const setupAppLock = useCallback(async () => {
    if (store.status !== 'authenticated') return;
    store.setHasAppLockSetup(true);
    store.setAppLocked(false);
  }, [store.status, store.setHasAppLockSetup, store.setAppLocked]);

  const disableAppLock = useCallback(async () => {
    if (store.status !== 'authenticated') return;
    store.setHasAppLockSetup(false);
    store.setAppLocked(false);
  }, [store.status, store.setHasAppLockSetup, store.setAppLocked]);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    if (store.status !== 'authenticated') return false;

    if (store.hasAppLockSetup) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Divya Jyoti Foundation',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });
      if (result.success) {
        store.setAppLocked(false);
        return true;
      }
      return false;
    }

    return true;
  }, [store.status, store.hasAppLockSetup, store.setAppLocked]);

  const resentOtp = useCallback(async (email: string) => {}, []);
  const validateOtp = useCallback(async (email: string, otp: string | number) => {
    throw new Error('OTP Validation not implemented in Medusa yet');
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
  const store = useAppStore();

  if (store.status !== 'authenticated' || !store.apiKey) {
    throw new Error('User is not authenticated');
  }

  return useMemo(
    () =>
      new Medusa({
        baseUrl: store.medusaUrl || process.env.EXPO_PUBLIC_MEDUSA_URL!,
        debug: false,
        auth: {
          type: 'jwt',
          jwtTokenStorageMethod: 'custom',
          storage: {
            getItem: () => store.apiKey!,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }),
    [store.medusaUrl, store.apiKey]
  );
};
