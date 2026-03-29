"use client";

import { useState } from "react";
import { registerUser, loginWithGoogle } from "@/features/auth/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !company) {
      setError("Please fill out all fields to register.");
      return;
    }
    try {
      await registerUser(email, password, name, company);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow border">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>
        {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Company Name</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 transition">Register</button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleAuth} 
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded shadow-sm hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.702-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.523 2.953 15.19 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z" />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
