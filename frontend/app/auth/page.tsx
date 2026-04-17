"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "";
    const name = fullName.includes("@") ? fullName.split("@")[0] : fullName;
    return name.trim().split(" ")[0] || "";
  };

  const firstName = getFirstName(user);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
        <div className="absolute bottom-[-80px] right-[-100px] w-96 h-96 rounded-full bg-cyan-500 blur-3xl"></div>
      </div>

      <nav className="relative z-10 bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3">
        <div className="mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between max-w-7xl">
          <div className="flex items-center gap-3 text-white">
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="w-11 h-11 rounded-3xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="font-bold text-slate-950">FP</span>
              </div>
              <div>
                <p className="font-semibold text-lg">FlowPay</p>
                <p className="text-xs text-slate-400">Secure wallet</p>
              </div>
            </Link>
          </div>

          {isAuthenticated && firstName ? (
            <div className="text-center text-sm text-slate-200 sm:text-base">
              <p className="uppercase tracking-[0.3em] text-emerald-300">Welcome back</p>
              <p className="mt-1 font-semibold">{firstName}</p>
            </div>
          ) : <div />}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20">
              Home
            </Link>
            <Link href="/dashboard" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20">
              Dashboard
            </Link>
            <Link href="/transfer" className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/20">
              Transfer
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center lg:px-10">
        <div className="w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Ready to manage your money
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Login or sign up to access FlowPay.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Secure wallet access, instant transfers, and transaction insights are one click away.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-4 text-sm font-semibold text-slate-950 transition hover:from-cyan-300 hover:to-emerald-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex min-w-[170px] items-center justify-center rounded-full border border-white/10 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl justify-center px-6 py-6 text-sm text-slate-500 lg:px-10">
          <p>© 2026 FlowPay. Built for modern finance.</p>
        </div>
      </footer>
    </div>
  );
}
