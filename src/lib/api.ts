// Thin fetch wrapper for the API Gateway backend (see sloud-solutions-infra's
// stacks/tools). Attaches the Cognito ID token; on 401 (expired/invalid
// session) logs out and bounces to the login page rather than failing silently.
import { getIdToken, logout } from "./auth";
import type { Me } from "./access";
import type { Expense } from "../data/expenses";
import type { Employee } from "../data/employees";

const BASE = import.meta.env.PUBLIC_API_BASE_URL as string;

export class ApiError extends Error {}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401) {
    logout();
    location.href = "/login";
    throw new ApiError("Your session expired. Please log in again.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body; keep the generic message */
    }
    throw new ApiError(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const getMe = () => request<Me>("/me");

export const listExpenses = () => request<Expense[]>("/expenses");
export const createExpense = (expense: Omit<Expense, "id" | "createdBy" | "createdAt">) =>
  request<Expense>("/expenses", { method: "POST", body: JSON.stringify(expense) });
export const deleteExpense = (id: string) => request<void>(`/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
export const updateExpense = (id: string, expense: Omit<Expense, "id" | "createdBy" | "createdAt">) =>
  request<Expense>(`/expenses/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(expense) });

interface DocumentUploadUrl {
  uploadUrl: string;
  documentUrl: string;
}

/** Gets a presigned S3 PUT URL for a bill/receipt upload, then puts the file directly to S3. */
export async function uploadExpenseDocument(file: File): Promise<{ documentUrl: string; documentName: string }> {
  const { uploadUrl, documentUrl } = await request<DocumentUploadUrl>("/expenses/document-url", {
    method: "POST",
    body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
  });
  const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!putRes.ok) throw new ApiError("The document upload failed. Please try again.");
  return { documentUrl, documentName: file.name };
}

export const listEmployees = () => request<Employee[]>("/employees");
export const deleteEmployee = (id: string) => request<void>(`/employees/${encodeURIComponent(id)}`, { method: "DELETE" });

export interface EmployeeEditPayload {
  name: string;
  role: string;
  type: Employee["type"];
  skills: string[];
  workingMode: Employee["workingMode"];
  phone: string;
  location: string;
  joined: string;
  workDashboard: string;
  accountRole: "Admin" | "Employee";
  access: string[];
  /** Optional — only sent (and only replaces the photo) when a new one was chosen. */
  photoDataUrl?: string;
}

/** Admin-only: edits an existing team member's profile/role/access (not their password or email). */
export const updateEmployee = (id: string, payload: EmployeeEditPayload) =>
  request<Employee>(`/employees/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });

export interface NewEmployeePayload {
  name: string;
  role: string;
  type: Employee["type"];
  skills: string[];
  workingMode: Employee["workingMode"];
  email: string;
  phone: string;
  location: string;
  joined: string;
  workDashboard: string;
  accountRole: "Admin" | "Employee";
  access: string[];
  /** Set directly by the Admin — these addresses aren't real mailboxes, so there's no email invite to rely on. */
  password: string;
  /** Optional canvas-resized JPEG/PNG data URL — small enough to send inline. */
  photoDataUrl?: string;
}

/** Admin-only: creates the Cognito login and the Employees-table row together. */
export const createEmployeeWithLogin = (payload: NewEmployeePayload) =>
  request<Employee>("/admin/users", { method: "POST", body: JSON.stringify(payload) });

/** Admin-only: resets someone's password directly (share the new one with them out-of-band). */
export const resetPassword = (email: string, password: string) =>
  request<void>("/admin/reset-password", { method: "POST", body: JSON.stringify({ email, password }) });

/** Admin-only: temporarily enable/disable someone's login without removing them. */
export const setEmployeeEnabled = (id: string, enabled: boolean) =>
  request<Employee>(`/employees/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ enabled }) });
