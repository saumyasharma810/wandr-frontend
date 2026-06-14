"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  getMe,
  authLogin,
  authRegister,
  authLogout,
  getAccessToken,
  clearTokens,
} from "../lib/api";
import { UserPublic } from "../lib/types";

interface AuthState {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session from token in localStorage
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await authLogin(username, password);
    const me = await getMe();
    setUser(me);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authRegister(username, email, password);
      await authLogin(username, password);
      const me = await getMe();
      setUser(me);
    },
    []
  );

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Redirects to /auth if not logged in. Returns null while loading.
export function useRequireAuth(): AuthState | null {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [auth.isLoading, auth.isAuthenticated]);
  if (auth.isLoading || !auth.isAuthenticated) return null;
  return auth;
}
