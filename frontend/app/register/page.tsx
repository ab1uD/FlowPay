"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/utils/api";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authApi.register(name, email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    alert("Account created! Please login.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-slate-900 font-bold text-lg">FP</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FlowPay
              </h1>
              <p className="text-slate-400">Create your account</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A11.955 11.955 0 0112 15c2.12 0 4.106.616 5.879 1.804M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl p-4 pl-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl p-4 pl-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl p-4 pl-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v6m-6-6c0-1.657-1.343-3-3-3S3 9.343 3 11v6a2 2 0 002 2h10a2 2 0 002-2v-6c0-1.657-1.343-3-3-3s-3 1.343-3 3" />
                  </svg>
                  <span>Create account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-slate-500 text-xs">
          Secure onboarding for your FlowPay wallet
        </div>
      </div>
    </div>
  );
}
