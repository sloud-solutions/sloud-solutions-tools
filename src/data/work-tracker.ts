// Dropdown options and types for the Work Tracker. Row data lives in
// DynamoDB (see sloud-solutions-infra's stacks/tools) — fetched via src/lib/api.ts.
export const TASK_STATUSES = ["todo", "in-progress", "completed", "blocked"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface WorkBoard {
  id: string;
  name: string;
  description: string;
  team: string;
  /** Creator's email — owner (and Admins) can edit membership and delete the board. */
  owner: string;
  /** Employee emails who can see and use this board, besides the owner. */
  members: string[];
  createdAt: string;
}

export interface WorkTask {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** Assignee's email; empty if unassigned. */
  assignee: string;
  priority: TaskPriority | "";
  /** ISO date (yyyy-mm-dd); empty if none set. */
  dueDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
