"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { Expense } from "@/types";
import { CheckCircle2, XCircle, AlertTriangle, FileImage, ShieldAlert, ShieldCheck } from "lucide-react";
import { simulateUPIPayout } from "@/lib/services/payoutSimulator";

export default function ApprovalsPage() {
  const { appUser } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser) return;
    
    // Listen for PENDING expenses tied to the active user's company
    const q = query(
      collection(db, "expenses"),
      where("companyId", "==", appUser.companyId),
      where("status", "==", "PENDING")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data()) as Expense[];
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setPendingExpenses(docs);
      setLoading(false);
    }, (error) => {
      console.error("Approvals Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  const handleDecision = async (expense: Expense, decision: 'APPROVED' | 'REJECTED') => {
    if (!appUser) return;
    setActionLoading(expense.id);

    try {
      const batch = writeBatch(db);

      // 1. Update Expense Document natively
      const expenseRef = doc(db, "expenses", expense.id);
      batch.update(expenseRef, {
        status: decision,
        updatedAt: Date.now()
      });

      // 2. Synthesize Historical Approval Document
      const approvalRef = doc(collection(db, "approvals"));
      batch.set(approvalRef, {
        id: approvalRef.id,
        status: decision,
        comments: comment || (decision === 'APPROVED' ? 'Looks good.' : 'Declined.'),
        expenseId: expense.id,
        managerId: appUser.id,
        managerName: appUser.name || appUser.email,
        managerEmail: appUser.email,
        expenseAmount: expense.amount,
        createdAt: Date.now()
      });

      await batch.commit();

      // Trigger UPI Payout simulation if approved
      if (decision === 'APPROVED') {
        const txn = await simulateUPIPayout(expense);
        if (txn) {
          console.log("Mock UPI Transaction Generated:", txn);
        }
      }

      setComment("");
      setSelectedExpense(null);

    } catch (err: any) {
      console.error("Approval transaction failed:", err);
      alert("Failed to process approval: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const THRESHOLD = 5000;

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading pending approvals...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approvals Queue</h1>
        <p className="text-gray-500 mt-1">Review, approve, and optionally reject active employee reimbursement claims.</p>
        
        {appUser?.role === 'EMPLOYEE' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start text-amber-800">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Notice:</strong> Your current Firebase role is <code className="bg-amber-100 px-1 rounded">EMPLOYEE</code>. 
              In production, you would naturally be blocked from seeing other people's pending expenses. 
              Only <code>MANAGERS</code> and <code>ADMINS</code> can process standard approvals.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {pendingExpenses.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <CheckCircle2 className="w-16 h-16 mb-4 text-green-400/50" />
            <h3 className="text-xl font-medium text-gray-600">All caught up!</h3>
            <p className="mt-1">There are absolutely no pending company expenses requiring your review.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {pendingExpenses.map((expense) => {
               const fScore = expense.fraudScore || 0;
               let fraudColor = "bg-green-100 text-green-700";
               let FraudIcon = ShieldCheck;
               if (fScore >= 50 && fScore < 80) fraudColor = "bg-amber-100 text-amber-700";
               if (fScore >= 80) { fraudColor = "bg-red-100 text-red-700"; FraudIcon = ShieldAlert; }

               return (
              <li key={expense.id} className="p-6 hover:bg-gray-50/50 transition duration-150">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Expense Info Block */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">₹{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      {expense.amount > THRESHOLD && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Value
                        </span>
                      )}
                      
                      {/* AI Fraud Score Badge */}
                      <span className={`px-2 py-0.5 text-xs font-bold rounded flex items-center ${fraudColor}`}>
                          <FraudIcon className="w-3 h-3 mr-1" />
                          Risk: {fScore}/100
                      </span>

                    </div>
                    <p className="text-sm text-gray-800 font-medium mb-1 flex items-center">
                      {expense.merchant || "Unknown Merchant"} 
                      <span className="text-gray-400 mx-2">•</span> 
                      <span className="text-gray-500 font-normal">{expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted by <span className="font-semibold text-gray-900">{expense.userName || expense.userEmail}</span> 
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{expense.categoryId}</span>
                    </p>
                  </div>

                  {/* Receipt Preview Logic */}
                  {expense.receiptUrl && expense.receiptUrl !== "base64-bypassed" && expense.receiptUrl !== "vision-ai-extracted" && expense.receiptUrl !== "offline-mode-placeholder" && (
                     <div className="hidden md:flex w-32 h-20 bg-gray-50 border border-gray-200 rounded items-center justify-center text-xs text-gray-500 hover:bg-gray-100 transition cursor-pointer shadow-sm">
                       <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center">
                         <FileImage className="w-5 h-5 mb-1" />
                         View Receipt
                       </a>
                     </div>
                  )}
                  {expense.receiptUrl === "vision-ai-extracted" && (
                      <div className="hidden md:flex w-32 h-20 bg-blue-50 border border-blue-100 rounded items-center justify-center text-xs text-blue-600 text-center px-3 shadow-sm font-medium">
                        Vision AI Scanned
                      </div>
                  )}
                  {expense.receiptUrl === "offline-mode-placeholder" && (
                      <div className="hidden md:flex w-32 h-20 bg-orange-50 border border-orange-200 rounded items-center justify-center text-[11px] text-orange-600 text-center px-1 shadow-sm font-medium">
                        Offline Match
                      </div>
                  )}

                  {/* Processing Actions */}
                  <div className="flex flex-col justify-center min-w-[220px]">
                    {selectedExpense === expense.id ? (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <input 
                          type="text" 
                          placeholder="Rejection reason... (optional)" 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button 
                            disabled={actionLoading === expense.id}
                            onClick={() => handleDecision(expense, 'REJECTED')}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold py-2 rounded-lg disabled:opacity-50 transition"
                          >
                            {actionLoading === expense.id ? "Working..." : "Confirm Reject"}
                          </button>
                          <button 
                            disabled={actionLoading === expense.id}
                            onClick={() => { setSelectedExpense(null); setComment(""); }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          disabled={actionLoading === expense.id}
                          onClick={() => handleDecision(expense, 'APPROVED')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center"
                        >
                          {actionLoading === expense.id ? "Working..." : <><CheckCircle2 className="w-4 h-4 mr-1.5"/> Approve</>}
                        </button>
                        <button 
                          disabled={actionLoading === expense.id}
                          onClick={() => setSelectedExpense(expense.id)}
                          className="flex-1 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 mr-1.5"/> Reject
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </li>
            )})}
          </ul>
        )}
      </div>
    </div>
  );
}
