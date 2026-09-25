"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getToken, removeToken } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const subscribe = () => () => { };

const getClientToken = () => getToken();

const getServerToken = () => null;

export function AuthProvider({ children }: AuthProviderProps) {
  const token = useSyncExternalStore(
    subscribe,
    getClientToken,
    getServerToken,
  );

  const isLoading = false;

  function logout() {
    removeToken();
    window.location.reload();
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}