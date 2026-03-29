"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { Expense } from "@/types";
import { 
  IndianRupee, 
  Clock, 
  XCircle, 
  CheckCircle2,
  FileText
} from "lucide-react";

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;

    // Fetch expenses tightly bound to the user's company
    const q = query(
      collection(db, "expenses"),
      where("companyId", "==", appUser.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data()) as Expense[];
      // Sort manually on client to avoid blocking on index creation
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setExpenses(docs);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>;

  // Calculate Metrics
  const totalSpend = expenses.filter(e => e.status === "PAID" || e.status === "APPROVED").reduce((acc, e) => acc + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === "PENDING").length;
  const rejectedCount = expenses.filter(e => e.status === "REJECTED").length;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved Spend</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{totalSpend.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingCount} Claims</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rejected Claims</p>
            <h3 className="text-2xl font-bold text-gray-900">{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" />
            Recent Expenses
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No expenses found for your company.</td></tr>
              ) : (
                expenses.slice(0, 10).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{expense.userName || expense.userEmail}</td>
                    <td className="px-6 py-4">{expense.merchant}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{expense.categoryId}</span>
                    </td>
                    <td className="px-6 py-4">{new Date(expense.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {expense.status === 'PENDING' && <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                      {expense.status === 'APPROVED' && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</span>}
                      {expense.status === 'PAID' && <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</span>}
                      {expense.status === 'REJECTED' && <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
