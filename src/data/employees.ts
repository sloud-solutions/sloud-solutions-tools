// PLACEHOLDER data: replace with real records once storage exists.
export const EMPLOYEE_TYPES = ["Full-time", "Part-time", "Intern", "Contractor"] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export const WORKING_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkingMode = (typeof WORKING_MODES)[number];

export interface Employee {
  id: string;
  name: string;
  role: string;
  type: EmployeeType;
  skills: string[];
  workingMode: WorkingMode;
  email: string;
  phone: string;
  location: string;
  joined: string;
  /** Small profile picture as a data URL; empty shows initials. */
  photo: string;
  /** Link to the employee's work dashboard; empty until the dashboard exists. */
  workDashboard: string;
}

export const EMPLOYEES: Employee[] = [
  {
    id: "e1",
    name: "Archana",
    role: "Founder and CEO",
    type: "Full-time",
    skills: ["Strategy", "Business Development", "Leadership"],
    workingMode: "Hybrid",
    email: "archana@sloudsolutions.com",
    phone: "+00 000 000 0001",
    location: "City, Country",
    joined: "2024-01-01",
    photo: "",
    workDashboard: "",
  },
  {
    id: "e2",
    name: "Sample Engineer (dummy)",
    role: "Cloud Engineer",
    type: "Full-time",
    skills: ["AWS", "Terraform", "CI/CD", "Docker"],
    workingMode: "Remote",
    email: "engineer@sloudsolutions.com",
    phone: "+00 000 000 0002",
    location: "Chennai, India",
    joined: "2025-03-10",
    photo: "",
    workDashboard: "",
  },
  {
    id: "e3",
    name: "Sample Intern (dummy)",
    role: "Web Developer Intern",
    type: "Intern",
    skills: ["HTML", "Tailwind", "JavaScript"],
    workingMode: "On-site",
    email: "intern@sloudsolutions.com",
    phone: "+00 000 000 0003",
    location: "Bengaluru, India",
    joined: "2026-07-01",
    photo: "",
    workDashboard: "",
  },
];
