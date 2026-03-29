export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type ApprovalStatus = 'APPROVED' | 'REJECTED';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string; // Firestore Document ID
  email: string;
  name?: string;
  role: Role;
  companyId: string;
  createdAt: number; // Unix timestamp
  updatedAt: number;
}

export interface Company {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  amount: number;
  merchant?: string;
  date?: number;
  status: ExpenseStatus;
  fraudScore?: number;
  ocrData?: any;
  categoryId?: string;
  projectId?: string;
  companyId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Approval {
  id: string;
  status: ApprovalStatus;
  comments?: string;
  expenseId: string;
  managerId: string;
  createdAt: number;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  embedding?: number[]; // Vector embeddings arrays
  companyId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  referenceId?: string;
  expenseId: string;
  paymentDate?: number;
  createdAt: number;
  updatedAt: number;
}
