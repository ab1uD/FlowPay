"use client";

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">FlowPay - Transfer</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
          >
            Back
          </button>
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
              <input
                type="number"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Enter wallet ID"
                required
              />
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
