"use client";

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
              onClick={() => setShowTransferModal(true)}
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
                  <tr className="border-b text-gray-500 text-sm font-semibold">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">
                        {tx.date
                          ? new Date(tx.date).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td
                        className={`py-3 px-2 font-semibold ${
                          tx.type === "sent"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "sent" ? "-" : "+"}KSh{" "}
                        {tx.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
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

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">

            <h2 className="text-xl font-bold mb-4">Transfer Money</h2>

            <form onSubmit={handleTransfer}>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Recipient Wallet ID
                </label>
                <div className="flex gap-2 items-start">
                  <input
                    type="number"
                    value={transferRecipientId}
                    onChange={(e) => {
                      setTransferRecipientId(e.target.value);
                      setRecipientValid(null);
                      setRecipientMessage("");
                    }}
                    placeholder="Enter wallet ID"
                    className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={verifyRecipient}
                    disabled={verifyingRecipient || transferRecipientId.trim() === ""}
                    className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                  >
                    {verifyingRecipient ? "Checking..." : "Verify"}
                  </button>
                </div>
                {recipientMessage && (
                  <p className={`mt-2 text-sm font-medium ${recipientValid ? "text-green-600" : "text-red-600"}`}>
                    {recipientMessage}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {transferError && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded">
                  {transferError}
                </p>
              )}

              {transferSuccess && (
                <p className="text-green-600 text-sm mb-3 bg-green-50 p-3 rounded font-medium">
                  Transfer successful!
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={transferLoading || !recipientValid}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {transferLoading ? "Transferring..." : "Transfer"}
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
                  className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-400 font-semibold"
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
