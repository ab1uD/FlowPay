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
      }, 1200);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-lg font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* NAVBAR */}
      <nav className="bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">FlowPay</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* WALLET CARD */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm opacity-80">Available Balance</p>

            <h2 className="text-4xl font-bold mt-2">
              KSh {balance !== null ? balance.toLocaleString() : "0"}
            </h2>

            {walletId && (
              <p className="text-xs opacity-70 mt-2">
                Wallet ID: {walletId}
              </p>
            )}

            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="mt-6 bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition w-full"
            >
              Add Money
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white p-6 rounded-2xl shadow-md border">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

            <button
              onClick={() => router.push("/transfer")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold w-full"
            >
              Transfer Money
            </button>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="py-2">Type</th>
                    <th>Wallet</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">
                        {tx.type === "sent" ? "Transfer" : "Received"}
                      </td>

                      <td className="text-gray-500 text-sm">
                        #{tx.other_party_wallet_id}
                      </td>

                      <td
                        className={`font-semibold ${
                          tx.type === "sent"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "sent" ? "-" : "+"}KSh{" "}
                        {tx.amount.toLocaleString()}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">

            <h2 className="text-xl font-bold mb-4">
              Add Money
            </h2>

            <form onSubmit={handleAddMoney}>

              <input
                type="number"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              {addMoneyError && (
                <p className="text-red-500 text-sm mb-2">
                  {addMoneyError}
                </p>
              )}

              {addMoneySuccess && (
                <p className="text-green-600 text-sm mb-2">
                  Money added successfully!
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addMoneyLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {addMoneyLoading ? "Adding..." : "Add"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddMoneyAmount("");
                    setAddMoneyError("");
                    setAddMoneySuccess(false);
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded-lg"
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
