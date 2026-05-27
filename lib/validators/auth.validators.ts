import { z } from "zod";

// ── Request schemas ────────────────────────────────────────────────────────────

export const SendOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, "Phone or email is required")
    .refine(
      (v) => /^[6-9]\d{9}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Must be a valid 10-digit Indian mobile number or email address"
    ),
});

export const VerifyOtpSchema = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must be numeric"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  identifier: z
    .string()
    .min(1)
    .refine(
      (v) => /^[6-9]\d{9}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Must be a valid phone or email"
    ),
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const AdminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ── Response types ─────────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // seconds
};

export type AuthUser = {
  id: string;
  name: string;
  identifier: string;
  role: "admin" | "user";
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

// ── Inferred request types ─────────────────────────────────────────────────────

export type SendOtpInput    = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput  = z.infer<typeof VerifyOtpSchema>;
export type RegisterInput   = z.infer<typeof RegisterSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type RefreshInput    = z.infer<typeof RefreshTokenSchema>;
