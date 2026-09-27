// PLACEHOLDER content: replace with the real client list.
export interface Client {
  name: string;
  industry: string;
  status: "Active" | "Completed" | "On hold";
  summary: string;
  work: string[];
}

export const CLIENTS: Client[] = [
  {
    name: "Client One (placeholder)",
    industry: "Retail",
    status: "Active",
    summary: "Placeholder: Cloud migration and ongoing DevOps support.",
    work: ["Migrated workloads to AWS", "Set up CI/CD pipelines", "Cost optimization review"],
  },
  {
    name: "Client Two (placeholder)",
    industry: "Healthcare",
    status: "Active",
    summary: "Placeholder: Custom web application and automation.",
    work: ["Built internal web portal", "Automated reporting workflows"],
  },
  {
    name: "Client Three (placeholder)",
    industry: "Finance",
    status: "Completed",
    summary: "Placeholder: Infrastructure assessment and security hardening.",
    work: ["Infrastructure assessment", "IAM and network hardening", "Handover documentation"],
  },
];
