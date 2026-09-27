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

export const listEmployees = () => request<Employee[]>("/employees");
export const deleteEmployee = (id: string) => request<void>(`/employees/${encodeURIComponent(id)}`, { method: "DELETE" });

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
  /** Optional canvas-resized JPEG/PNG data URL — small enough to send inline. */
  photoDataUrl?: string;
}

/** Admin-only: creates the Cognito login and the Employees-table row together. */
export const createEmployeeWithLogin = (payload: NewEmployeePayload) =>
  request<Employee>("/admin/users", { method: "POST", body: JSON.stringify(payload) });
