"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { walletApi, transactionApi } from "@/utils/api";

export default function TransferPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [myWalletId, setMyWalletId] = useState<number | null>(null);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientMessage, setRecipientMessage] = useState("");
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Fetch current balance
    const fetchBalance = async () => {
      const result = await walletApi.getBalance();
      if (result.data) {
        setBalance(result.data.balance);
        setMyWalletId(result.data.id);
      }
    };
    fetchBalance();
  }, [isAuthenticated, router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const walletIdNum = parseInt(walletId);
    const amountNum = parseFloat(amount);

    if (isNaN(walletIdNum)) {
      setError("Please enter a valid wallet ID");
      setLoading(false);
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    if (amountNum > balance) {
      setError("Insufficient balance");
      setLoading(false);
      return;
    }

    if (myWalletId !== null && walletIdNum === myWalletId) {
      setError("You cannot transfer to your own wallet");
      setLoading(false);
      return;
    }

    const result = await transactionApi.transfer(walletIdNum, amountNum);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Transfer successful!");
      // Refresh balance
      const walletResult = await walletApi.getBalance();
      if (walletResult.data) {
        setBalance(walletResult.data.balance);
      }
      setWalletId("");
      setAmount("");
    }

    setLoading(false);
  };

  const verifyRecipient = async () => {
    setError("");
    setSuccess("");
    setRecipientMessage("");
    setRecipientValid(null);

    const walletIdNum = parseInt(walletId);
    if (isNaN(walletIdNum)) {
      setRecipientMessage("Please enter a valid wallet ID to verify");
      setRecipientValid(false);
      return;
    }

    if (myWalletId !== null && walletIdNum === myWalletId) {
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
      setRecipientMessage("Recipient wallet verified");
      setRecipientValid(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">FP</span>
            </div>
            <div>
              <p className="font-semibold">FlowPay</p>
              <p className="text-xs text-slate-400">Transfer</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-900"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Transfer Money</h2>

          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Your Wallet ID</p>
            <p className="text-lg font-bold">{myWalletId}</p>
            <p className="text-sm text-gray-500">Share this ID to receive money</p>
          </div>

          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">
              KSh {balance.toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleTransfer}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Recipient Wallet ID
              </label>
              <div className="flex gap-2 items-start">
                <input
                  type="number"
                  value={walletId}
                  onChange={(e) => {
                    setWalletId(e.target.value);
                    setRecipientValid(null);
                    setRecipientMessage("");
                  }}
                  className="border p-2 w-full rounded"
                  placeholder="Enter wallet ID"
                  required
                />
                <button
                  type="button"
                  onClick={verifyRecipient}
                  disabled={verifyingRecipient || walletId.trim() === ""}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingRecipient ? "Checking..." : "Verify"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use the recipient's wallet ID shown on their dashboard.
              </p>
              {recipientMessage && (
                <p className={`mt-1 text-sm ${recipientValid ? "text-green-600" : "text-red-600"}`}>
                  {recipientMessage}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Enter amount"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Transferring..." : "Transfer"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
