export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white">
      
      <div className="text-center max-w-xl px-6">
        
        <h1 className="text-5xl font-bold mb-4">
          FlowPay
        </h1>

        <p className="text-lg opacity-90 mb-8">
          Send and receive money instantly with a secure peer-to-peer wallet.
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Register
          </a>
        </div>

      </div>

    </div>
  );
}