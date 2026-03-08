export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600">
          FlowPay
        </h1>

        <p className="mt-4 text-gray-600">
          Peer-to-Peer Digital Wallet
        </p>

        <div className="mt-6 space-x-4">
          <a
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </a>

          <a
            href="/register"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}