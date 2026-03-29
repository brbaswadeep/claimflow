export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type ApprovalStatus = 'APPROVED' | 'REJECTED';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string; 
  email: string;
  name?: string;
  role: Role;
  companyId: string;
  createdAt: number; 
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
  receiptUrl?: string;
  categoryId?: string;
  projectId?: string;
  
  companyId: string;
  userId: string;
  
  // Denormalized joining fields for N+1 prevention
  userName: string;
  userEmail: string;
  companyName: string;

  createdAt: number;
  updatedAt: number;
}

export interface Approval {
  id: string;
  status: ApprovalStatus;
  comments?: string;
  
  expenseId: string;
  managerId: string;
  
  // Denormalized joining fields
  managerName: string;
  managerEmail: string;
  expenseAmount: number;

  createdAt: number;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  
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
  
  // Denormalized
  merchant?: string;

  paymentDate?: number;
  createdAt: number;
  updatedAt: number;
}
