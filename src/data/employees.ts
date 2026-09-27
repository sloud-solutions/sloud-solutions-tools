// Dropdown options for the Employees form. Row data itself now lives in
// DynamoDB (see sloud-solutions-infra's stacks/tools) — fetched via src/lib/api.ts.
import type { PageKey } from "../lib/access";

export const EMPLOYEE_TYPES = ["Full-time", "Part-time", "Intern", "Contractor"] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export const WORKING_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkingMode = (typeof WORKING_MODES)[number];

export interface Employee {
  id: string;
  name: string;
  /** Job title / designation, e.g. "Cloud Engineer" — distinct from `accountRole` below. */
  role: string;
  type: EmployeeType;
  skills: string[];
  workingMode: WorkingMode;
  email: string;
  phone: string;
  location: string;
  joined: string;
  /** CloudFront URL of the uploaded photo; empty shows initials. */
  photo: string;
  /** Link to the employee's work dashboard; empty until the dashboard exists. */
  workDashboard: string;
  /** Admin: full access to every page. Employee: limited to `access` below. */
  accountRole: "Admin" | "Employee";
  access: PageKey[];
  /** Cognito login enabled/disabled. Missing on older rows means enabled. */
  enabled?: boolean;
}
