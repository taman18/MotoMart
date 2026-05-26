"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

type Step = "identifier" | "otp";
type Method = "phone" | "email";

function LoginForm() {
  const { loginUser, sendOtp, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [method, setMethod] = useState<Method>("phone");
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<Step>("identifier");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [shownOtp, setShownOtp] = useState(""); // demo only
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoggedIn) router.replace(redirectTo);
  }, [isLoggedIn, router, redirectTo]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(
      () => setResendCountdown((c) => c - 1),
      1000
    );
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendCountdown]);

  function validateIdentifier() {
    if (method === "phone") {
      if (!/^[6-9]\d{9}$/.test(identifier))
        return "Enter a valid 10-digit mobile number.";
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
        return "Enter a valid email address.";
    }
    return null;
  }

  async function handleSendOtp() {
    const err = validateIdentifier();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    const result = await sendOtp(identifier);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Failed to send OTP."); return; }
    // Show OTP in demo
    if (result.otp) setShownOtp(result.otp);
    setStep("otp");
    setInfo(`OTP sent to ${identifier}`);
    setResendCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setError(""); setLoading(true);
    const result = await loginUser(identifier, code);
    setLoading(false);
    if (result.ok) {
      router.replace(redirectTo);
    } else {
      setError(result.error ?? "Invalid OTP.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          {step === "otp" && (
            <button
              onClick={() => { setStep("identifier"); setOtp(["","","","","",""]); setError(""); setShownOtp(""); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Change number
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {step === "identifier" ? "Sign In" : "Verify OTP"}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === "identifier"
              ? "Enter your mobile or email to continue"
              : `We sent a 6-digit code to ${identifier}`}
          </p>
        </div>

        <div className="px-7 pb-7 space-y-5">
          {/* Error / Info */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {info && step === "otp" && !error && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {info}
            </div>
          )}

          {step === "identifier" && (
            <>
              {/* Method toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => { setMethod("phone"); setIdentifier(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    method === "phone"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" /> Mobile
                </button>
                <button
                  onClick={() => { setMethod("email"); setIdentifier(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    method === "email"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {method === "phone" ? "Mobile Number" : "Email Address"}
                </label>
                <div className="relative">
                  {method === "phone" ? (
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-xl">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        placeholder="9876543210"
                        maxLength={10}
                        className="flex-1 px-3 py-3 text-sm border border-gray-200 rounded-r-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                      />
                    </div>
                  ) : (
                    <input
                      type="email"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || !identifier}
                className="w-full flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send OTP <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              {/* OTP boxes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-12 text-center text-lg font-bold border rounded-xl outline-none transition-all ${
                        digit
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-gray-200 text-gray-900"
                      } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                    />
                  ))}
                </div>
              </div>

              {/* Demo OTP hint */}
              {shownOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
                  <span className="font-semibold">Demo OTP:</span>{" "}
                  <code className="font-mono font-bold text-amber-900">{shownOtp}</code>
                  <span className="text-amber-600 ml-1">(shown for demo purposes)</span>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend OTP in{" "}
                    <span className="font-semibold text-gray-600">{resendCountdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={async () => {
                      setOtp(["","","","","",""]);
                      setShownOtp("");
                      await handleSendOtp();
                    }}
                    className="flex items-center gap-1.5 text-sm text-primary-700 hover:underline font-medium mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            New to MotoMart?{" "}
            <Link href="/register" className="text-primary-700 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Demo hint */}
      <div className="mt-4 bg-white/80 backdrop-blur rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 text-center">
          <span className="font-semibold text-gray-700">Demo accounts:</span>{" "}
          <code className="bg-gray-100 px-1 rounded">9876543210</code>{" "}
          or{" "}
          <code className="bg-gray-100 px-1 rounded">test@example.com</code>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
