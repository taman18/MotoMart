/**
 * useAuthActions — high-level auth hook that wraps RTK Query mutations.
 *
 * Provides a clean interface for components:
 *   const { sendOtp, verifyOtp, register, adminLogin, logout, isLoading, error } = useAuthActions();
 *
 * Components never import from authApi directly — they use this hook.
 */

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useAdminLoginMutation,
  useLogoutMutation,
} from "@/store/api/authApi";
import {
  selectRefreshToken,
  selectIsLoggedIn,
  selectIsAdmin,
  selectCurrentUser,
} from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";
import type {
  SendOtpInput,
  VerifyOtpInput,
  RegisterInput,
  AdminLoginInput,
} from "@/lib/validators/auth.validators";

/** Normalises RTK Query's serialised error into a plain message */
function extractError(err: unknown): string {
  if (!err) return "Something went wrong.";
  // RTK Query wraps fetch errors in { data: { ok, error: { message } } }
  const rtk = err as { data?: { error?: { message?: string } }; error?: string; message?: string };
  return (
    rtk?.data?.error?.message ??
    rtk?.error ??
    rtk?.message ??
    "Something went wrong."
  );
}

export function useAuthActions() {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Selectors ────────────────────────────────────────────────────────────────
  const user       = useAppSelector(selectCurrentUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isAdmin    = useAppSelector(selectIsAdmin);
  const refreshTok = useAppSelector(selectRefreshToken);

  // ── RTK mutations ────────────────────────────────────────────────────────────
  const [sendOtpMutation,    { isLoading: sendingOtp    }] = useSendOtpMutation();
  const [verifyOtpMutation,  { isLoading: verifyingOtp  }] = useVerifyOtpMutation();
  const [registerMutation,   { isLoading: registering   }] = useRegisterMutation();
  const [adminLoginMutation, { isLoading: adminLogging  }] = useAdminLoginMutation();
  const [logoutMutation,     { isLoading: loggingOut    }] = useLogoutMutation();

  // ── Actions ──────────────────────────────────────────────────────────────────

  /** Send OTP to phone/email. Returns the demo OTP (non-prod only). */
  const sendOtp = useCallback(
    async (input: SendOtpInput): Promise<{ ok: boolean; otp?: string; error?: string }> => {
      setLocalError(null);
      try {
        const res = await sendOtpMutation(input).unwrap();
        return { ok: true, otp: res.data.otp };
      } catch (err) {
        const msg = extractError(err);
        setLocalError(msg);
        return { ok: false, error: msg };
      }
    },
    [sendOtpMutation]
  );

  /** Verify OTP — logs the user in if account exists. */
  const verifyOtp = useCallback(
    async (input: VerifyOtpInput, redirectTo = "/"): Promise<{ ok: boolean; error?: string }> => {
      setLocalError(null);
      try {
        await verifyOtpMutation(input).unwrap();
        router.replace(redirectTo);
        return { ok: true };
      } catch (err) {
        const msg = extractError(err);
        setLocalError(msg);
        return { ok: false, error: msg };
      }
    },
    [verifyOtpMutation, router]
  );

  /** Register new user (OTP already sent/verified server-side). */
  const register = useCallback(
    async (input: RegisterInput): Promise<{ ok: boolean; error?: string }> => {
      setLocalError(null);
      try {
        await registerMutation(input).unwrap();
        router.replace("/");
        return { ok: true };
      } catch (err) {
        const msg = extractError(err);
        setLocalError(msg);
        return { ok: false, error: msg };
      }
    },
    [registerMutation, router]
  );

  /** Admin username + password login. */
  const adminLogin = useCallback(
    async (input: AdminLoginInput): Promise<{ ok: boolean; error?: string }> => {
      setLocalError(null);
      try {
        await adminLoginMutation(input).unwrap();
        router.replace("/admin");
        return { ok: true };
      } catch (err) {
        const msg = extractError(err);
        setLocalError(msg);
        return { ok: false, error: msg };
      }
    },
    [adminLoginMutation, router]
  );

  /** Logout — clears Redux state, localStorage, and cookie. */
  const logout = useCallback(
    async (redirectTo = "/"): Promise<void> => {
      setLocalError(null);
      try {
        if (refreshTok) await logoutMutation({ refreshToken: refreshTok }).unwrap();
      } finally {
        router.replace(redirectTo);
      }
    },
    [logoutMutation, refreshTok, router]
  );

  const clearError = useCallback(() => setLocalError(null), []);

  return {
    // state
    user,
    isLoggedIn,
    isAdmin,
    error: localError,
    isLoading: sendingOtp || verifyingOtp || registering || adminLogging || loggingOut,
    // granular loading flags
    isSendingOtp:   sendingOtp,
    isVerifyingOtp: verifyingOtp,
    isRegistering:  registering,
    isAdminLogging: adminLogging,
    isLoggingOut:   loggingOut,
    // actions
    sendOtp,
    verifyOtp,
    register,
    adminLogin,
    logout,
    clearError,
  };
}
