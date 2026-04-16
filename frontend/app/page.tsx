import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
        <div className="absolute bottom-[-80px] right-[-100px] w-96 h-96 rounded-full bg-cyan-500 blur-3xl"></div>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center lg:px-10">
        <div className="w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            FlowPay
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Financial freedom for modern wallets.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Start with FlowPay and experience faster transfers, real-time balance updates, and secure wallet management.
          </p>

          <Link
            href="/auth"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-10 py-4 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:from-emerald-300 hover:to-cyan-300"
          >
            Get Started
          </Link>
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
