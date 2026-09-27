// PLACEHOLDER content: replace with the real company policy text.
export interface PolicySection {
  id: string;
  title: string;
  body: string[];
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    body: [
      "Placeholder: All team members are expected to act with integrity, respect colleagues and clients, and represent Sloud Solutions professionally.",
      "Placeholder: Harassment or discrimination of any kind is not tolerated.",
    ],
  },
  {
    id: "working-hours",
    title: "Working Hours & Attendance",
    body: [
      "Placeholder: Standard working hours, remote-work expectations, and how to report availability.",
    ],
  },
  {
    id: "leave",
    title: "Leave Policy",
    body: [
      "Placeholder: Types of leave, how to request it, and approval process.",
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality & Data Protection",
    body: [
      "Placeholder: Client and company information must be kept confidential and handled only through approved tools.",
    ],
  },
  {
    id: "internships",
    title: "Internship Guidelines",
    body: [
      "Placeholder: Duration, mentorship, evaluation, and certificate criteria for interns.",
    ],
  },
];
