import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as authApi from "@/api/authApi";
import type { AuthUser } from "@/api/types/auth";
import { onUnauthorized } from "@/auth/authEvents";
import { clearToken, getToken, setToken } from "@/auth/tokenStorage";

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the initial session-restore check is in flight. */
  isLoading: boolean;
  /** True while a login submission is in flight. */
  isLoggingIn: boolean;
  loginError: string | null;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission?: string) => boolean;
  hasAnyPermission: (permissions: (string | undefined)[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const toAuthUser = (res: { userId: number; userName: string; permissions: string[] }): AuthUser => ({
    userId: res.userId,
    userName: res.userName,
    permissions: res.permissions,
  });

  // Restore session on cold start: if a token is already stored, validate it
  // against /auth/me. Any failure (network error, 401, etc.) clears the
  // token and leaves the user logged out.
  useEffect(() => {
    (async () => {
      try {
        const existing = await getToken();
        if (!existing) {
          return;
        }
        const res = await authApi.me();
        if (mounted.current) {
          setUser(toAuthUser(res));
        }
      } catch {
        await clearToken();
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    })();
  }, []);

  // The axios interceptor emits this on any 401 — clear local session state
  // so the root layout redirects back to /login.
  useEffect(() => {
    return onUnauthorized(() => {
      clearToken().finally(() => {
        if (mounted.current) {
          setUser(null);
        }
      });
    });
  }, []);

  const login = useCallback(async (userName: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await authApi.login({ userName, password });
      if (res.token) {
        await setToken(res.token);
      }
      setUser(toAuthUser(res));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setLoginError(message);
      throw err;
    } finally {
      if (mounted.current) {
        setIsLoggingIn(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — the mobile session is token-based, not cookie-based.
    }
    await clearToken();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission?: string) => {
      if (!permission) {
        return true;
      }
      return user?.permissions.includes(permission) ?? false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: (string | undefined)[]) => permissions.some((p) => hasPermission(p)),
    [hasPermission]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isLoggingIn,
      loginError,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isLoading, isLoggingIn, loginError, login, logout, hasPermission, hasAnyPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
