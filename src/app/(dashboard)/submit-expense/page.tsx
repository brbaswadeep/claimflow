"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { db } from "@/lib/firebase/client";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, Loader2, FileImage } from "lucide-react";
import { calculateFraudScore } from "@/lib/services/fraudDetection";

export default function SubmitExpensePage() {
  const { appUser } = useAuth();
  const router = useRouter();
  
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("TRAVEL");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser) return;

    setIsScanning(true);
    setError(null);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const base64String = (event.target?.result as string).split(',')[1];
          setBase64File(base64String);
          setUploadProgress(100); 

          if (!navigator.onLine) {
            setError("You are offline. AI extraction requires an internet connection. You can enter details manually, and it will be queued.");
            setReceiptUrl("offline-mode-placeholder");
            setIsScanning(false);
            return;
          }

          const res = await fetch('/api/extract-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: base64String })
          });

          const { data, error: extractError } = await res.json();
          
          if (!extractError && data) {
            if (data.amount) setAmount(data.amount.toString());
            if (data.merchant) setMerchant(data.merchant.substring(0, 50));
            if (data.date && data.date !== "Unknown") setDate(data.date);
          } else {
            setError("OCR Extraction failed. Please enter details manually.");
          }
          
          setReceiptUrl("vision-ai-extracted");
        } catch (ocrErr) {
          console.error("OCR Routing failed", ocrErr);
          setError("Vision API service failed to respond. Please enter manually.");
        } finally {
          setIsScanning(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        setError("Failed to read the file locally.");
        setIsScanning(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const expenseDateMs = new Date(date).getTime();
      const numAmount = parseFloat(amount);
      
      let companyName = "Unknown Company";
      if (!isOffline) {
        try {
          const companyDoc = await getDoc(doc(db, "companies", appUser.companyId));
          companyName = companyDoc.exists() ? companyDoc.data().name : "Unknown Company";
        } catch(err) { /* ignore if offline or failing */ }
      }

      // 1. Calculate Fraud Score using our lightweight rule engine
      let fScore = 0;
      if (!isOffline) {
        fScore = await calculateFraudScore({
          amount: numAmount,
          merchant,
          date: expenseDateMs,
          userId: appUser.id
        });
      }

      const expenseRef = doc(collection(db, "expenses"));
      const newExpense = {
        id: expenseRef.id,
        amount: numAmount,
        merchant,
        date: expenseDateMs,
        status: "PENDING",
        categoryId: category,
        receiptUrl: receiptUrl || null,
        fraudScore: fScore,
        
        userId: appUser.id,
        companyId: appUser.companyId,
        userName: appUser.name || "Unknown User",
        userEmail: appUser.email,
        companyName,
        
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (isOffline) {
        const queue = JSON.parse(localStorage.getItem("claimflow_offline_queue") || "[]");
        queue.push(newExpense);
        localStorage.setItem("claimflow_offline_queue", JSON.stringify(queue));
      } else {
        await setDoc(expenseRef, newExpense);
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (error: any) {
      console.error("Failed to submit expense:", error);
      setError("Failed to submit expense: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            {isOffline ? "Expense Saved Offline!" : "Expense Submitted!"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isOffline ? "It will sync when you are back online." : "Redirecting to your dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Submit an Expense
          {isOffline && <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded">OFFLINE MODE</span>}
        </h1>
        <p className="text-gray-500 mt-1">Upload a receipt image or manually enter your expenses.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: File Upload & OCR */}
        <div className="col-span-1 border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white flex flex-col items-center justify-center text-center relative hover:bg-gray-50 transition min-h-[220px]">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isScanning}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          />
          
          {isScanning ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-600 mb-3 animate-spin" />
              <h3 className="font-semibold text-blue-800">Scanning Receipt...</h3>
              <p className="text-sm text-blue-600/80 mt-1">
                {uploadProgress < 100 
                  ? `Uploading ${uploadProgress}%` 
                  : "Extracting Text (OCR)..."}
              </p>
            </div>
          ) : receiptUrl ? (
            <div className="flex flex-col items-center border p-2 rounded-lg bg-green-50 border-green-200">
              <FileImage className="w-10 h-10 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-800 text-sm">Receipt Scanned via AI</h3>
              <p className="text-[10px] text-green-700 mt-1 cursor-pointer underline">Click to upload another</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-700">Upload Receipt</h3>
              <p className="text-sm text-gray-500 mt-1">Images only. Auto-extracts details natively via Vision AI.</p>
            </div>
          )}
        </div>

        {/* Right Column: Form */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border p-6 text-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Date incurred</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Merchant Name</label>
              <input 
                type="text" 
                value={merchant} 
                onChange={(e) => setMerchant(e.target.value)} 
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="E.g., Amazon, Uber, Taj Hotels"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="TRAVEL">Travel & Transport</option>
                <option value="LODGING">Lodging & Hotels</option>
                <option value="MEALS">Meals & Entertainment</option>
                <option value="EQUIPMENT">Office Equipment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="pt-4 border-t mt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting || isScanning}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Saving..." : "Submit Expense"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
