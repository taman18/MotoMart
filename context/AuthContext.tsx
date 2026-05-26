"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  name: string;
  identifier: string; // email or phone
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginUser: (identifier: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (name: string, identifier: string) => Promise<{ ok: boolean; error?: string }>;
  sendOtp: (identifier: string) => Promise<{ ok: boolean; otp?: string; error?: string }>;
  logout: () => void;
}

const SESSION_KEY = "motomart_session";

const AuthContext = createContext<AuthContextValue | null>(null);

// Simulated user store (in-memory for demo)
const mockUsers: Record<string, { name: string; identifier: string }> = {
  "9876543210": { name: "Rajesh Kumar", identifier: "9876543210" },
  "test@example.com": { name: "Test User", identifier: "test@example.com" },
};

// In-memory OTP store keyed by identifier
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function persist(u: AuthUser) {
    setUser(u);
    const serialised = JSON.stringify(u);
    localStorage.setItem(SESSION_KEY, serialised);
    // Also write a cookie so Next.js middleware can gate /admin/* server-side
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(serialised)}; path=/; max-age=86400; SameSite=Lax`;
  }

  const loginAdmin = useCallback(
    async (username: string, password: string) => {
      const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
      const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (username === validUser && password === validPass) {
        persist({ name: "Admin", identifier: username, role: "admin" });
        return { ok: true };
      }
      return { ok: false, error: "Invalid username or password." };
    },
    []
  );

  const sendOtp = useCallback(async (identifier: string) => {
    const isPhone = /^[6-9]\d{9}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isPhone && !isEmail) {
      return { ok: false, error: "Enter a valid phone number or email." };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[identifier] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    // In production you'd send SMS/email here. We return OTP for demo.
    console.info(`[MotoMart OTP] ${identifier} → ${otp}`);
    return { ok: true, otp };
  }, []);

  const loginUser = useCallback(async (identifier: string, otp: string) => {
    const record = otpStore[identifier];
    if (!record) return { ok: false, error: "Request a new OTP first." };
    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return { ok: false, error: "OTP expired. Please request a new one." };
    }
    if (record.otp !== otp) return { ok: false, error: "Incorrect OTP." };

    delete otpStore[identifier];

    const existing = mockUsers[identifier];
    if (!existing) return { ok: false, error: "Account not found. Please register first." };

    persist({ name: existing.name, identifier, role: "user" });
    return { ok: true };
  }, []);

  const registerUser = useCallback(async (name: string, identifier: string) => {
    if (mockUsers[identifier]) {
      return { ok: false, error: "Account already exists. Please log in." };
    }

    const record = otpStore[identifier];
    if (!record) return { ok: false, error: "Verify OTP before registering." };
    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return { ok: false, error: "OTP expired. Please request a new one." };
    }

    delete otpStore[identifier];
    mockUsers[identifier] = { name, identifier };
    persist({ name, identifier, role: "user" });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoggedIn: !!user,
        loginAdmin,
        loginUser,
        registerUser,
        sendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
