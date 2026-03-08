export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mb-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Create Account
        </button>
      </div>
    </div>
  );
}