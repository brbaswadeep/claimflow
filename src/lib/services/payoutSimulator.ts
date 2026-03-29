import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Transaction, Expense } from "@/types";

/**
 * Simulates a UPI payment and creates a transaction record.
 * Generates a mock UPI Reference ID.
 */
export const simulateUPIPayout = async (expense: Expense): Promise<Transaction | null> => {
  try {
    const transactionId = `txn_${Date.now()}`;
    const upiRef = `UPI${Math.floor(Math.random() * 1000000000000)}`;

    const transaction: Transaction = {
      id: transactionId,
      amount: expense.amount,
      status: "COMPLETED",
      referenceId: upiRef,
      expenseId: expense.id,
      merchant: expense.merchant,
      paymentDate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 1. Create Transaction Document
    await setDoc(doc(db, "transactions", transactionId), transaction);

    // 2. Update Expense Status to PAID
    const expenseRef = doc(db, "expenses", expense.id);
    await updateDoc(expenseRef, {
      status: "PAID",
      updatedAt: Date.now(),
    });

    return transaction;
  } catch (error) {
    console.error("Payout Simulation Error:", error);
    return null;
  }
};
