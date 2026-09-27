// PLACEHOLDER data: replace with real records once storage exists.
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
}

export const EXPENSES: Expense[] = [
  { id: "x1", date: "2026-09-02", item: "Domain renewal – sloudsolutions.com", vendor: "Namecheap", category: "Software", amount: 1299, paidBy: "Archana", status: "Paid", notes: "" },
  { id: "x2", date: "2026-09-10", item: "AWS monthly bill", vendor: "Amazon Web Services", category: "Cloud / Hosting", amount: 2450, paidBy: "Company card", status: "Paid", notes: "August usage" },
  { id: "x3", date: "2026-09-15", item: "Laptop for new intern", vendor: "Croma", category: "Hardware", amount: 48500, paidBy: "Archana", status: "Reimbursable", notes: "Invoice #4471" },
  { id: "x4", date: "2026-09-21", item: "Google Workspace (3 seats)", vendor: "Google", category: "Software", amount: 1620, paidBy: "Company card", status: "Pending", notes: "" },
];
