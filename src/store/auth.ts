import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/lib/api";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lastLoginDevice: string | null;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      email: null,
      fullName: null,
      role: null,
      lastLoginAt: null,
      lastLoginIp: null,
      lastLoginDevice: null,
      setAuth: (auth) =>
        set({
          token: auth.accessToken,
          refreshToken: auth.refreshToken,
          email: auth.email,
          fullName: auth.fullName,
          role: auth.role,
          lastLoginAt: auth.lastLoginAt,
          lastLoginIp: auth.lastLoginIp,
          lastLoginDevice: auth.lastLoginDevice,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          email: null,
          fullName: null,
          role: null,
          lastLoginAt: null,
          lastLoginIp: null,
          lastLoginDevice: null,
        }),
    }),
    { name: "nextgen-admin-auth" }
  )
);
