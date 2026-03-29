import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface FraudCheckParams {
  amount: number;
  merchant?: string;
  date?: number; // timestamp in ms
  userId: string;
}

export const calculateFraudScore = async (expense: FraudCheckParams): Promise<number> => {
  let score = 0;

  // 1. High Amount Check (> ₹1,00,000 max)
  if (expense.amount > 100000) {
    score += 40;
  }

  // 2. Weekend/Holiday Check
  if (expense.date) {
    const d = new Date(expense.date);
    const day = d.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      score += 10;
    }
  }

  // 3. Duplicate Entry Check (Same amount, same merchant, last 30 days, same user)
  if (expense.merchant && expense.date) {
    const thirtyDaysAgo = expense.date - (30 * 24 * 60 * 60 * 1000);
    
    try {
      const expensesRef = collection(db, "expenses");
      const q = query(
        expensesRef,
        where("userId", "==", expense.userId),
        where("amount", "==", expense.amount),
        where("merchant", "==", expense.merchant)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filter by date post-query to keep index requirements simple
      const duplicates = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.date >= thirtyDaysAgo && data.date <= expense.date;
      });

      if (duplicates.length > 0) {
        score += 80;
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      // Gracefully continue even if duplicate check fails (e.g., missing index)
    }
  }

  // Cap score at 100
  return Math.min(score, 100);
};
