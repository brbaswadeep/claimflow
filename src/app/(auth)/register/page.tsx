"use client";

import { useState } from "react";
import { registerUser } from "@/features/auth/auth.service";
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
    try {
      await registerUser(email, password, name, company);
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
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Company Name</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 transition">Register</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
