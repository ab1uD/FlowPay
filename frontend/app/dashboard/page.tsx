"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { walletApi, transactionApi } from "@/utils/api";

interface Transaction {
  amount: number;
  type: "sent" | "received";
  other_party_wallet_id: number;
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      // Fetch wallet balance
      const walletResult = await walletApi.getBalance();
      if (walletResult.error) {
        setError(walletResult.error);
      } else if (walletResult.data) {
        setBalance(walletResult.data.balance);
        setWalletId(walletResult.data.id);
      }

      // Fetch transactions
      const transactionsResult = await transactionApi.getAll();
      if (transactionsResult.error) {
        setError(transactionsResult.error);
      } else if (transactionsResult.data) {
        setTransactions(transactions);
      }

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
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
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">FlowPay</h1>
          <div className="flex items-center gap-4">
            <span>{user}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Wallet Card */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-2">Wallet Balance</h2>
            <p className="text-3xl font-bold text-green-600">
              KSh {balance !== null ? balance.toLocaleString() : "0"}
            </p>
            {walletId && (
              <p className="text-sm text-gray-500 mt-2">
                Your Wallet ID: {walletId}
              </p>
            )}
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
            >
              Add Money
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <button
              onClick={() => router.push("/transfer")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
            >
              Transfer Money
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="border-b pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {tx.type === "sent" ? "Money Sent" : "Money Received"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.type === "sent" 
                          ? `To Wallet #${tx.other_party_wallet_id}` 
                          : `From Wallet #${tx.other_party_wallet_id}`}
                      </p>
                    </div>
                    <p className={`font-bold ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                      {tx.type === "sent" ? "-" : "+"}KSh {tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Money to Wallet</h2>
            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount (KSh)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {addMoneyError && (
                <div className="mb-4 text-red-600 text-sm">{addMoneyError}</div>
              )}
              {addMoneySuccess && (
                <div className="mb-4 text-green-600 text-sm">Money added successfully!</div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addMoneyLoading}
                  className="flex-1 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {addMoneyLoading ? "Adding..." : "Add Money"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddMoneyError("");
                    setAddMoneyAmount("");
                    setAddMoneySuccess(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
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
