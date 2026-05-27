"use client";

/**
 * AuthContext — thin bridge between Redux/RTK Query and the rest of the app.
 *
 * All existing pages that call useAuth() continue working unchanged.
 * Internally, everything now flows through the Hono API via RTK Query.
 */

import React, { createContext, useContext } from "react";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppSelector } from "@/store/hooks";
import { selectIsHydrated } from "@/store/slices/authSlice";
import type { AuthUser } from "@/lib/validators/auth.validators";

export type UserRole = "admin" | "user";
export type { AuthUser };

interface AuthContextValue {
  user:         AuthUser | null;
  isAdmin:      boolean;
  isLoggedIn:   boolean;
  isHydrated:   boolean;
  sendOtp:      (identifier: string) => Promise<{ ok: boolean; otp?: string; error?: string }>;
  loginUser:    (identifier: string, otp: string, redirectTo?: string) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (name: string, identifier: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  loginAdmin:   (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout:       (redirectTo?: string) => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export default function AuthContext({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoggedIn,
    isAdmin,
    sendOtp:    sendOtpAction,
    verifyOtp:  verifyOtpAction,
    register:   registerAction,
    adminLogin: adminLoginAction,
    logout:     logoutAction,
  } = useAuthActions();

  const isHydrated = useAppSelector(selectIsHydrated);

  async function sendOtp(identifier: string) {
    return sendOtpAction({ identifier });
  }

  async function loginUser(identifier: string, otp: string, redirectTo = "/") {
    return verifyOtpAction({ identifier, otp }, redirectTo);
  }

  async function registerUser(name: string, identifier: string, otp: string) {
    return registerAction({ name, identifier, otp });
  }

  async function loginAdmin(username: string, password: string) {
    return adminLoginAction({ username, password });
  }

  async function logout(redirectTo = "/") {
    return logoutAction(redirectTo);
  }

  return (
    <AuthCtx.Provider value={{ user, isAdmin, isLoggedIn, isHydrated, sendOtp, loginUser, registerUser, loginAdmin, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthContext");
  return ctx;
}
