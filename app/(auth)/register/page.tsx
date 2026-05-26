"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Step = "details" | "otp";
type Method = "phone" | "email";

export default function RegisterPage() {
  const { registerUser, sendOtp, isLoggedIn } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<Method>("phone");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<Step>("details");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [shownOtp, setShownOtp] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

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

  function validateDetails() {
    if (!name.trim()) return "Full name is required.";
    if (method === "phone" && !/^[6-9]\d{9}$/.test(identifier))
      return "Enter a valid 10-digit mobile number.";
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
      return "Enter a valid email address.";
    return null;
  }

  async function handleSendOtp() {
    const err = validateDetails();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    const result = await sendOtp(identifier);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Failed to send OTP."); return; }
    if (result.otp) setShownOtp(result.otp);
    setStep("otp");
    setResendCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  async function handleRegister() {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setError(""); setLoading(true);
    const result = await registerUser(name.trim(), identifier);
    setLoading(false);
    if (result.ok) {
      router.replace("/");
    } else {
      setError(result.error ?? "Registration failed.");
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
              onClick={() => { setStep("details"); setOtp(["","","","","",""]); setError(""); setShownOtp(""); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {step === "details" ? "Create Account" : "Verify OTP"}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === "details"
              ? "Join MotoMart — get exclusive deals & order tracking"
              : `Enter the 6-digit code sent to ${identifier}`}
          </p>
        </div>

        <div className="px-7 pb-7 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {step === "details" && (
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

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Rajesh Kumar"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              {/* Identifier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {method === "phone" ? "Mobile Number" : "Email Address"}
                </label>
                {method === "phone" ? (
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-xl">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
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
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || !identifier || !name.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3.5 rounded-xl transition-colors"
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
              {/* Summary chip */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{name}</span>
                  {" · "}
                  {method === "phone" ? "+91 " : ""}{identifier}
                </div>
              </div>

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
                          ? "border-accent-500 bg-orange-50 text-accent-700"
                          : "border-gray-200 text-gray-900"
                      } focus:border-accent-500 focus:ring-2 focus:ring-orange-100`}
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
                onClick={handleRegister}
                disabled={loading || otp.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
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

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
