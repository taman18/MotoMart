"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Eye, EyeOff, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const { loginAdmin, isAdmin } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await loginAdmin(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace("/admin");
    } else {
      setError(result.error ?? "Login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-700 opacity-20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 opacity-10 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-gray-900 px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-accent-500 p-2 rounded-xl">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Moto<span className="text-accent-500">Mart</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <ShieldCheck className="w-4 h-4 text-primary-300" />
              <p className="text-primary-300 text-sm font-medium">Admin Portal</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-6">Sign in with your admin credentials</p>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="admin"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-800 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Store customer?{" "}
                <a href="/" className="text-primary-700 hover:underline font-medium">
                  Go to MotoMart
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Hint card (remove in prod) */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
          <p className="text-white/60 text-xs text-center">
            <span className="text-white/80 font-semibold">Demo creds:</span>{" "}
            username: <code className="text-accent-400">admin</code> &nbsp;/&nbsp;
            password: <code className="text-accent-400">MotoMart@2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}
