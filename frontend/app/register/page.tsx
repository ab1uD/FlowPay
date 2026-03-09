"use client";

import { useRouter } from "next/navigation";

export default function Register() {

  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    
    alert("Account created! Please login.");

    
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700"
        >
          Create Account
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </form>

    </div>
  );
}