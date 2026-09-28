// Thin fetch wrapper for the API Gateway backend (see sloud-solutions-infra's
// stacks/tools). Attaches the Cognito ID token; on 401 (expired/invalid
// session) logs out and bounces to the login page rather than failing silently.
import { getIdToken, logout } from "./auth";
import type { Me } from "./access";
import type { Expense } from "../data/expenses";
import type { Employee } from "../data/employees";
import type { WorkBoard, WorkTask } from "../data/work-tracker";

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

export interface EmployeeOption {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
}

/** Available to anyone with Expense Tracker or Work Tracker access (not just Employees access) -- powers the "paid by"/assignee/member pickers. */
export const listEmployeeOptions = () => request<EmployeeOption[]>("/employees");

export interface EmployeeEditPayload {
  employeeId?: string;
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
  employeeId?: string;
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

export const listWorkBoards = () => request<WorkBoard[]>("/work-boards");
export const createWorkBoard = (payload: Omit<WorkBoard, "id" | "owner" | "createdAt">) =>
  request<WorkBoard>("/work-boards", { method: "POST", body: JSON.stringify(payload) });
/** Owner or Admin only. */
export const updateWorkBoard = (id: string, payload: Partial<Omit<WorkBoard, "id" | "owner" | "createdAt">>) =>
  request<WorkBoard>(`/work-boards/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
/** Owner or Admin only — also deletes every task on the board. */
export const deleteWorkBoard = (id: string) => request<void>(`/work-boards/${encodeURIComponent(id)}`, { method: "DELETE" });

export interface CloudResource {
  arn: string;
  resourceType: string;
  service: string;
  region: string;
  lastReportedAt: string;
}

export interface CloudResourcesResponse {
  resources: CloudResource[];
  count: number;
  generatedAt: string;
}

/** Admin-only: live account-wide inventory via AWS Resource Explorer. */
export const listCloudResources = () => request<CloudResourcesResponse>("/cloud-resources");

export interface CostByService {
  service: string;
  amount: number;
}

export interface CostBudget {
  name: string;
  limit: number;
  unit: string;
  period: string;
  actualSpend: number;
}

export interface CostSummary {
  total: number;
  currency: string;
  byService: CostByService[];
  budget: CostBudget | null;
  periodStart: string;
  periodEnd: string;
  updatedAt: string | null;
}

/**
 * Admin-only: reads a cache written by a scheduled Lambda, never calls Cost
 * Explorer itself -- safe to call as often as the page wants (it's a plain
 * DynamoDB read), since Cost Explorer is billed per API request and must
 * stay decoupled from page views. See sloud-solutions-infra's cost-poller.
 */
export const getCostSummary = () => request<CostSummary>("/cost-summary");

export type ResumeStatus = "pending" | "consider" | "not_consider";

export interface Application {
  id: string;
  jobSlug: string;
  jobTitle: string;
  segment: string;
  name: string;
  email: string;
  phone: string;
  coverNote: string;
  submittedAt: string;
  status: ResumeStatus;
  statusUpdatedAt: string | null;
  statusUpdatedBy: string | null;
}

export interface ApplicationsResponse {
  applications: Application[];
  count: number;
}

/** Admin-only: every job application submitted through the website's careers "Apply" form. */
export const listResumes = () => request<ApplicationsResponse>("/resumes");

/** Admin-only: mints a fresh, short-lived presigned S3 URL for one application's resume file. */
export const getResumeUrl = (id: string) => request<{ url: string }>(`/resumes/${encodeURIComponent(id)}/resume-url`);

/** Admin-only: permanently removes the application record and its resume file from S3. */
export const deleteResume = (id: string) => request<void>(`/resumes/${encodeURIComponent(id)}`, { method: "DELETE" });

/** Admin-only: tags an application Consider / Not Consider / Pending. */
export const updateResumeStatus = (id: string, status: ResumeStatus) =>
  request<Application>(`/resumes/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });

export const listWorkTasks = (boardId: string) => request<WorkTask[]>(`/work-boards/${encodeURIComponent(boardId)}/tasks`);
export const createWorkTask = (boardId: string, payload: Omit<WorkTask, "id" | "boardId" | "createdBy" | "createdAt" | "updatedAt">) =>
  request<WorkTask>(`/work-boards/${encodeURIComponent(boardId)}/tasks`, { method: "POST", body: JSON.stringify(payload) });
export const updateWorkTask = (id: string, payload: Partial<Omit<WorkTask, "id" | "boardId" | "createdBy" | "createdAt" | "updatedAt">>) =>
  request<WorkTask>(`/work-tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteWorkTask = (id: string) => request<void>(`/work-tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
