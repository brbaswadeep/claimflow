"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { User, Mail, Shield, Building } from "lucide-react";

export default function ProfilePage() {
  const { appUser } = useAuth();

  if (!appUser) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl text-blue-600 font-bold uppercase shrink-0">
            {appUser.name?.charAt(0) || "U"}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{appUser.name || "Unknown User"}</h2>
            <p className="text-gray-500 font-medium tracking-wide mt-1">ClaimFlow ID: {appUser.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Details</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Email Address</p>
                <p className="text-gray-900 font-medium">{appUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">System Role</p>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  {appUser.role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Organization Details</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Building className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Company Affiliation</p>
                <p className="text-gray-900 font-medium truncate max-w-[200px]" title={appUser.companyId}>
                  {appUser.companyId}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
