import Link from "next/link";
import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="h-full px-3 py-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            <li>
              <Link href="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/submit-expense" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <span className="ml-3">Submit Expense</span>
              </Link>
            </li>
            <li>
              <Link href="/approvals" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <span className="ml-3">Approvals</span>
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <span className="ml-3">Analytics</span>
              </Link>
            </li>
            <li>
              <Link href="/admin" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <span className="ml-3">Admin Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
      </div>
    </ProtectedRoute>
  );
}
