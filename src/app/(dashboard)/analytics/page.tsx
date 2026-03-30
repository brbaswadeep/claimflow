"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { Expense } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const { appUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    
    // Admin/Manager views company-wide data
    const q = query(
      collection(db, "expenses"),
      where("companyId", "==", appUser.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data()) as Expense[];
      setExpenses(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading analytics...</div>;

  // Process data for charts
  const approvedOrPaid = expenses.filter(e => e.status === "APPROVED" || e.status === "PAID");
  
  // Category Breakdown
  const categoryMap = approvedOrPaid.reduce((acc, curr) => {
    acc[curr.categoryId || "OTHER"] = (acc[curr.categoryId || "OTHER"] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Monthly Spending Trend (Last 6 Months)
  const monthlyMap = approvedOrPaid.reduce((acc, curr) => {
    const d = new Date(curr.createdAt);
    const month = d.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Ensure chronological order could be improved, but simple object keys work for current year mostly
  const monthlyData = Object.keys(monthlyMap).map(key => ({
    name: key,
    amount: monthlyMap[key]
  }));

  // Approval Status Distribution
  const statusMap = expenses.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusMap).map(key => ({
    name: key,
    value: statusMap[key]
  }));

  const STATUS_COLORS = {
    'PENDING': '#f59e0b',
    'APPROVED': '#10b981',
    'PAID': '#3b82f6',
    'REJECTED': '#ef4444'
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Analytics</h1>
      <p className="text-gray-500 mb-8">Interactive breakdowns of company spending and claim statuses.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category breakdown (Pie) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-800 self-start mb-6">Spend by Category</h2>
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No approved data</div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Claim Status (Pie) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-800 self-start mb-6">Claim Status Distribution</h2>
          {statusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(STATUS_COLORS as any)[entry.name] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value} claims`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Trend (Bar) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Approved Spend Trend</h2>
          {monthlyData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">No trend data available</div>
          ) : (
            <div className="w-full h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`} 
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
