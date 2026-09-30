// Dropdown options and types for the Attendance Tracker. Row data lives in
// DynamoDB (see sloud-solutions-infra's stacks/tools) — fetched via src/lib/api.ts.
export const ATTENDANCE_STATUSES = ["Available", "Not Available"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceRecord {
  /** `${employeeId}#${date}` — one row per employee per day; re-submitting the same day upserts it. */
  id: string;
  employeeId: string;
  employeeName: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  status: AttendanceStatus;
  /** 0 when status is "Not Available". */
  hoursWorked: number;
  /** Empty when status is "Not Available". */
  workSummary: string;
  /** Empty when status is "Available". */
  reason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
