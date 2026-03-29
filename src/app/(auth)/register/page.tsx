"use client";

import { useState, useEffect } from "react";
import { registerOrganization, joinAsEmployee, getRegisteredCompanies, loginWithGoogle } from "@/features/auth/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Company } from "@/types";

export default function RegisterPage() {
  const [tab, setTab] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
  
  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin Specific
  const [companyName, setCompanyName] = useState("");

  // Employee Specific
  const [employeeName, setEmployeeName] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // Load registered companies for employees
  useEffect(() => {
    if (tab === "EMPLOYEE" && companies.length === 0) {
      getRegisteredCompanies().then(res => setCompanies(res));
    }
  }, [tab, companies.length]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "ADMIN") {
        if (!companyName || !email || !password) {
          throw new Error("Please provide Company Name, Email, and Password.");
        }
        // Use companyName as the user's name for Admin accounts
        await registerOrganization(email, password, companyName, companyName);
      } else {
        if (!employeeName || !email || !password || !selectedCompanyId) {
          throw new Error("Please fill out all Employee details and select an organization.");
        }
        await joinAsEmployee(email, password, employeeName, selectedCompanyId);
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Minimum password is 6 characters.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#043d2c]">ClaimFlow</h2>
          <p className="text-sm text-gray-500 mt-2">Set up your workspace</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button 
            type="button"
            className={`flex-1 py-4 text-sm font-semibold rounded-md transition-all ${tab === "ADMIN" ? "bg-white text-[#043d2c] shadow" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => { 
                setTab("ADMIN"); 
                setError(""); 
                setEmail(""); 
                setPassword(""); 
            }}
          >
            Register Company
          </button>
          <button 
            type="button"
            className={`flex-1 py-4 text-sm font-semibold rounded-md transition-all ${tab === "EMPLOYEE" ? "bg-white text-[#043d2c] shadow" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => { 
                setTab("EMPLOYEE"); 
                setError(""); 
                setEmail(""); 
                setPassword(""); 
            }}
          >
            Employee Login
          </button>
        </div>

        {error && <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          {tab === "ADMIN" ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Name</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="E.g., Stark Industries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Admin Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="admin@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Your Organization</label>
                <input 
                  type="text"
                  placeholder="Search registered companies..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCompanyId(""); // Clear selection on search
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c] mb-1" 
                />
                
                {/* Searchable Combobox */}
                {searchQuery && !selectedCompanyId && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map(c => (
                        <button 
                          key={c.id} 
                          type="button" 
                          onClick={() => { setSelectedCompanyId(c.id); setSearchQuery(c.name); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-[#fafaf9] focus:bg-[#fafaf9] border-b border-gray-50 last:border-0 outline-none transition"
                        >
                         <span className="font-semibold block">{c.name}</span>
                         <span className="text-xs text-gray-400">ID: {c.id}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No organizations found matching "{searchQuery}"</div>
                    )}
                  </div>
                )}
                {selectedCompanyId && (
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Organization selected
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={employeeName} 
                  onChange={(e) => setEmployeeName(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="E.g., Jane Fisher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Work Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="jane@organization.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#043d2c]/20 focus:border-[#043d2c]" 
                  placeholder="••••••••"
                />
              </div>
            </>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#043d2c] text-white rounded-lg py-3 font-bold tracking-wide hover:bg-[#07563f] transition shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? "Processing..." : (tab === "ADMIN" ? "Register Company" : "Secure Login")}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400 font-medium">Or</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleAuth} 
          disabled={loading}
          className="w-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.702-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.523 2.953 15.19 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z" />
          </svg>
          Google Instant Auth
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already registered? <Link href="/login" className="text-[#043d2c] font-bold hover:underline">Log in securely</Link>
        </p>
      </div>
    </div>
  );
}
