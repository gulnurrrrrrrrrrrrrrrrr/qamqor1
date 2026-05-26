"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, SessionUser } from "@/lib/auth/types";
import { ROLE_HOME } from "@/lib/auth/types";
import { can, type Permission } from "@/lib/auth/permissions";
import { api } from "@/lib/api/client";

interface AuthContextValue {
  user: SessionUser | null;
  role: Role | null;
  loading: boolean;
  register: (input: { email: string; password: string; name: string; role: Role }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (p: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const register = useCallback(
    async (input: { email: string; password: string; name: string; role: Role }) => {
      const { user: u } = await api.register(input);
      setUser(u);
      router.push(ROLE_HOME[u.role]);
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await api.login(email, password);
      setUser(u);
      router.push(ROLE_HOME[u.role]);
    },
    [router]
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
    router.push("/onboarding");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      register,
      login,
      signOut,
      refresh,
      hasPermission: (p: Permission) => can(user?.role ?? null, p),
    }),
    [user, loading, register, login, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
