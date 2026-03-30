"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthProvider";
import { logoutUser } from "@/features/auth/auth.service";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  FileCheck, 
  BarChart3, 
  Settings, 
  MessageSquare,
  User,
  LogOut,
  Shield
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { appUser } = useAuth();
  const router = useRouter();
  
  const isManagerOrAdmin = appUser?.role === "MANAGER" || appUser?.role === "ADMIN";
  const isEmployee = appUser?.role === "EMPLOYEE";

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="h-full px-4 py-6 overflow-y-auto flex flex-col justify-between">
          <ul className="space-y-2 font-medium">
            <div className="px-2 mb-6">
              <h1 className="text-xl font-bold text-[#043d2c]">ClaimFlow</h1>
            </div>

            <li>
              <Link href="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <LayoutDashboard className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#043d2c]" />
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            
            {/* Employee Specific Links */}
            {isEmployee && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee Workspace</div>
                <li>
                  <Link href="/submit-expense" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <Receipt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#043d2c]" />
                    <span className="ml-3">Submit Expense</span>
                  </Link>
                </li>
                <li>
                  <Link href="/chatbot" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <MessageSquare className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#043d2c]" />
                    <span className="ml-3">Policy Chatbot</span>
                  </Link>
                </li>
              </>
            )}

            {/* Admin/Manager Actions (Companies) */}
            {isManagerOrAdmin && (
              <>
                <div className="pt-6 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Management</div>
                <li>
                  <Link href="/approvals" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <FileCheck className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-amber-600" />
                    <span className="ml-3">Pending Approvals</span>
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <BarChart3 className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-amber-600" />
                    <span className="ml-3">Spend Analytics</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <Settings className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-amber-600" />
                    <span className="ml-3">Company Settings</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="mt-auto pt-6 pb-12 border-t border-gray-100">
            {/* User Profile Overview */}
            <div className="mb-4 px-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#e8f5f1] flex items-center justify-center text-[#043d2c] font-bold uppercase shrink-0">
                  {appUser?.name?.charAt(0) || "C"}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">{appUser?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{appUser?.email}</p>
                </div>
              </div>
            </div>

            <ul className="space-y-1 font-medium text-sm">
              <li>
                <Link href="/profile" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
                  <User className="w-4 h-4 text-gray-500 transition duration-75 group-hover:text-[#043d2c]" />
                  <span className="ml-3">My Profile</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 text-red-600 rounded-lg hover:bg-red-50 group transition"
                >
                  <LogOut className="w-4 h-4 text-red-500 transition duration-75 group-hover:text-red-600" />
                  <span className="ml-3">Logout</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
      </div>
    </ProtectedRoute>
  );
}
