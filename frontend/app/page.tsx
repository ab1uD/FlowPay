export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white px-6">

      {/* HERO SECTION */}
      <div className="text-center max-w-xl">

        <h1 className="text-5xl font-bold mb-4">
          FlowPay
        </h1>

        <p className="text-lg mb-8">
          Peer-to-Peer Digital Wallet
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow"
          >
            Login
          </a>

          <a
            href="/register"
            className="border border-white px-6 py-3 rounded-lg font-semibold"
          >
            Register
          </a>
        </div>

      </div>


      {/* 👇 ADD FEATURE CARDS HERE */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl">

        <div className="bg-white text-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Instant Transfers</h3>
          <p className="text-sm">
            Send money instantly to other FlowPay users.
          </p>
        </div>

        <div className="bg-white text-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Secure Wallet</h3>
          <p className="text-sm">
            Your funds are protected with secure authentication.
          </p>
        </div>

        <div className="bg-white text-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-2">Transaction History</h3>
          <p className="text-sm">
            Track all your payments and transfers easily.
          </p>
        </div>

      </div>

    </div>
  )
}