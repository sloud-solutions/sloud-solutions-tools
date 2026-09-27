// Dropdown options for the Expense Tracker form. Row data itself now lives in
// DynamoDB (see sloud-solutions-infra's stacks/tools) — fetched via src/lib/api.ts.
export const EXPENSE_CATEGORIES = ["Software", "Hardware", "Cloud / Hosting", "Office", "Travel", "Marketing", "Other"] as const;
export const PAYMENT_STATUSES = ["Paid", "Pending", "Reimbursable"] as const;
export const AUTO_RENEWAL_OPTIONS = ["Yes", "No"] as const;

// Kept in sync with expenses-document-presign's ALLOWED_TYPES and MAX_BYTES.
export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const DOCUMENT_ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

export interface Expense {
  id: string;
  date: string;
  item: string;
  vendor: string;
  category: (typeof EXPENSE_CATEGORIES)[number];
  amount: number;
  paidBy: string;
  status: (typeof PAYMENT_STATUSES)[number];
  notes: string;
  expiryDate: string;
  autoRenewal: (typeof AUTO_RENEWAL_OPTIONS)[number];
  documentUrl?: string;
  documentName?: string;
  createdBy?: string;
  createdAt?: string;
}
