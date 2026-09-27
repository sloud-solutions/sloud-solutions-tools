// Dropdown options for the Expense Tracker form. Row data itself now lives in
// DynamoDB (see sloud-solutions-infra's stacks/tools) — fetched via src/lib/api.ts.
export const EXPENSE_CATEGORIES = ["Software", "Hardware", "Cloud / Hosting", "Office", "Travel", "Marketing", "Other"] as const;
export const PAYMENT_STATUSES = ["Paid", "Pending", "Reimbursable"] as const;

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
  createdBy?: string;
  createdAt?: string;
}
