"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { walletApi, transactionApi } from "@/utils/api";

interface Transaction {
  amount: number;
  type: "sent" | "received";
  other_party_wallet_id: number;
  date?: string;
  status?: "completed" | "pending" | "failed";
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();

  const [balance, setBalance] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneyError, setAddMoneyError] = useState("");
  const [addMoneySuccess, setAddMoneySuccess] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferRecipientId, setTransferRecipientId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientMessage, setRecipientMessage] = useState("");
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const walletResult = await walletApi.getBalance();
        if (walletResult.error) throw new Error(walletResult.error);

        if (walletResult.data) {
          setBalance(walletResult.data.balance);
          setWalletId(walletResult.data.id);
        }

        const transactionsResult = await transactionApi.getAll();
        if (transactionsResult.error) throw new Error(transactionsResult.error);

        if (transactionsResult.data) {
          setTransactions(transactionsResult.data);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }

      setLoading(false);
    };

    fetchData();

    // Real-time balance update - polling every 10 seconds
    const balanceInterval = setInterval(async () => {
      try {
        const walletResult = await walletApi.getBalance();
        if (walletResult.data) {
          setBalance(walletResult.data.balance);
        }

        const transactionsResult = await transactionApi.getAll();
        if (transactionsResult.data) {
          setTransactions(transactionsResult.data);
        }
      } catch (err: any) {
        // Silent error - don't show loading state for background updates
        console.error("Failed to update balance:", err.message);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(balanceInterval);
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMoneyError("");
    setAddMoneySuccess(false);

    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      setAddMoneyError("Please enter a valid amount");
      return;
    }

    setAddMoneyLoading(true);

    const result = await walletApi.addMoney(amount);

    setAddMoneyLoading(false);

    if (result.error) {
      setAddMoneyError(result.error);
    } else if (result.data) {
      setBalance(result.data.balance);
      setAddMoneySuccess(true);
      setAddMoneyAmount("");

      setTimeout(() => {
        setShowAddMoneyModal(false);
        setAddMoneySuccess(false);
      }, 1200);
    }
  };

  const verifyRecipient = async () => {
    setTransferError("");
    setRecipientMessage("");
    setRecipientValid(null);

    const walletIdNum = parseInt(transferRecipientId);
    if (isNaN(walletIdNum)) {
      setRecipientMessage("Please enter a valid wallet ID to verify");
      setRecipientValid(false);
      return;
    }

    if (walletId !== null && walletIdNum === walletId) {
      setRecipientMessage("You cannot verify your own wallet");
      setRecipientValid(false);
      return;
    }

    setVerifyingRecipient(true);
    const result = await walletApi.verify(walletIdNum);
    setVerifyingRecipient(false);

    if (result.error) {
      setRecipientMessage(result.error);
      setRecipientValid(false);
    } else {
      setRecipientMessage("Recipient wallet verified ✓");
      setRecipientValid(true);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess(false);

    const recipientIdNum = parseInt(transferRecipientId);
    const amountNum = parseFloat(transferAmount);

    if (isNaN(recipientIdNum)) {
      setTransferError("Please enter a valid wallet ID");
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError("Please enter a valid amount");
      return;
    }

    if (balance !== null && amountNum > balance) {
      setTransferError("Insufficient balance");
      return;
    }

    if (walletId !== null && recipientIdNum === walletId) {
      setTransferError("You cannot transfer to your own wallet");
      return;
    }

    if (!recipientValid) {
      setTransferError("Please verify the recipient wallet first");
      return;
    }

    setTransferLoading(true);

    const result = await transactionApi.transfer(recipientIdNum, amountNum);

    setTransferLoading(false);

    if (result.error) {
      setTransferError(result.error);
    } else {
      setTransferSuccess(true);
      // Refresh balance
      const walletResult = await walletApi.getBalance();
      if (walletResult.data) {
        setBalance(walletResult.data.balance);
      }
      // Refresh transactions
      const transactionsResult = await transactionApi.getAll();
      if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
      setTransferRecipientId("");
      setTransferAmount("");

      setTimeout(() => {
        setShowTransferModal(false);
        setTransferSuccess(false);
        setRecipientValid(null);
        setRecipientMessage("");
      }, 1200);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <div className="text-emerald-400 font-semibold">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">FP</span>
              </div>
              <div>
                <p className="font-semibold">FlowPay</p>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20">
                Home
              </Link>
              <Link href="/dashboard" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20">
                Dashboard
              </Link>
              <Link href="/transfer" className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/20">
                Transfer
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{user}</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-xs">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* WELCOME SECTION */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user}!</h2>
          <p className="text-slate-400">Manage your finances with ease</p>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* BALANCE CARD - FULL WIDTH ON MOBILE, 2 COLS ON DESKTOP */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Total Balance</p>
                    <h2 className="text-4xl font-bold text-white">
                      KSh {balance !== null ? balance.toLocaleString() : "0"}
                    </h2>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>

                {walletId && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-6">
                    <p className="text-emerald-100 text-xs font-medium mb-1">Wallet ID</p>
                    <p className="text-white font-mono text-sm">{walletId}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAddMoneyModal(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Money</span>
                  </button>

                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS CARD */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Quick Stats</span>
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">This Month</p>
                <p className="text-white font-bold text-lg">
                  +KSh {transactions.filter(tx => tx.type === 'received' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Transactions</p>
                <p className="text-white font-bold text-lg">{transactions.length}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-emerald-400 font-bold text-lg">
                  {transactions.length > 0 ? Math.round((transactions.filter(tx => tx.status === 'completed').length / transactions.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS SECTION */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Recent Transactions</span>
              </h3>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-400 text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-slate-500">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="py-4 px-6 text-left text-slate-400 font-semibold text-sm">Date</th>
                    <th className="py-4 px-6 text-left text-slate-400 font-semibold text-sm">Type</th>
                    <th className="py-4 px-6 text-left text-slate-400 font-semibold text-sm">Amount</th>
                    <th className="py-4 px-6 text-left text-slate-400 font-semibold text-sm">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        {tx.date
                          ? new Date(tx.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : "N/A"}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "sent"
                              ? "bg-red-500/20"
                              : "bg-emerald-500/20"
                          }`}>
                            <svg className={`w-4 h-4 ${
                              tx.type === "sent"
                                ? "text-red-400"
                                : "text-emerald-400"
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {tx.type === "sent" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              )}
                            </svg>
                          </div>
                          <span className={`font-medium ${
                            tx.type === "sent"
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}>
                            {tx.type === "sent" ? "Sent" : "Received"}
                          </span>
                        </div>
                      </td>

                      <td className={`py-4 px-6 font-bold text-lg ${
                        tx.type === "sent"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}>
                        {tx.type === "sent" ? "-" : "+"}KSh {tx.amount.toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : tx.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            tx.status === "completed"
                              ? "bg-emerald-400"
                              : tx.status === "pending"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}></div>
                          {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD MONEY MODAL */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span>Add Money</span>
              </h2>
              <button
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setAddMoneyAmount("");
                  setAddMoneyError("");
                  setAddMoneySuccess(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount (KSh)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">KSh</span>
                  </div>
                  <input
                    type="number"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 pl-16 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {addMoneyError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{addMoneyError}</span>
                </div>
              )}

              {addMoneySuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Money added successfully!</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addMoneyLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {addMoneyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Money</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddMoneyAmount("");
                    setAddMoneyError("");
                    setAddMoneySuccess(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span>Transfer Money</span>
              </h2>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferRecipientId("");
                  setTransferAmount("");
                  setTransferError("");
                  setTransferSuccess(false);
                  setRecipientValid(null);
                  setRecipientMessage("");
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Recipient Wallet ID
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={transferRecipientId}
                      onChange={(e) => {
                        setTransferRecipientId(e.target.value);
                        setRecipientValid(null);
                        setRecipientMessage("");
                      }}
                      placeholder="Enter wallet ID"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyRecipient}
                    disabled={verifyingRecipient || transferRecipientId.trim() === ""}
                    className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 disabled:text-slate-500 px-4 py-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    {verifyingRecipient ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-300"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                </div>
                {recipientMessage && (
                  <div className={`mt-3 px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    recipientValid
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      recipientValid ? "bg-emerald-500/20" : "bg-red-500/20"
                    }`}>
                      {recipientValid ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{recipientMessage}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount (KSh)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">KSh</span>
                  </div>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 pl-16 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {transferError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{transferError}</span>
                </div>
              )}

              {transferSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Transfer successful!</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={transferLoading || !recipientValid}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {transferLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>Transfer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferRecipientId("");
                    setTransferAmount("");
                    setTransferError("");
                    setTransferSuccess(false);
                    setRecipientValid(null);
                    setRecipientMessage("");
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
