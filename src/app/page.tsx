import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Reimbursement Management Platform</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Automate expense submissions, approvals, and streamline company payouts with our modern multi-tenant solution.
      </p>
      <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
        Go to Dashboard
      </Link>
    </div>
  );
}
