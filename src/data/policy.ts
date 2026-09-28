export interface PolicySection {
  id: string;
  title: string;
  body: string[];
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "code-of-conduct",
    title: "1. Code of Conduct",
    body: [
      "Every team member is expected to act with honesty, integrity and professionalism in all dealings with colleagues, clients, vendors and the public, both online and offline.",
      "Treat everyone with courtesy and respect. Discrimination, harassment, bullying or victimisation of any kind — on the basis of gender, religion, caste, disability, marital status, sexual orientation or any other protected characteristic — will not be tolerated.",
      "Represent Sloud Solutions professionally in all client and public interactions. Do not make commitments, quote prices or speak on behalf of the Company without appropriate authorisation.",
      "Comply with all applicable laws, and with Company policies communicated from time to time. Report any suspected violation of this Code, or of law, to your reporting manager or HR without fear of retaliation.",
      "Conflicts of interest, gifts from clients/vendors beyond nominal value, and any outside engagement that competes with or could compromise your work at Sloud Solutions must be disclosed to HR in advance.",
      "Use of Company assets, systems and paid tools (including generative AI tools) is for legitimate work purposes; disclose AI-assisted work where materially used, and independently verify its output before relying on it.",
      "Consumption of alcohol or any intoxicant during working hours, or reporting to work under its influence, is strictly prohibited.",
    ],
  },
  {
    id: "working-hours",
    title: "2. Working Hours & Attendance",
    body: [
      "We work Monday to Saturday, 8 hours a day, with flexible start and end times — there is no fixed clock-in time. Structure your day around your peak productivity, as long as you overlap with your team for meetings, stand-ups and collaboration.",
      "We manage by outcomes, not by the clock. We trust you to plan your own time and deliver what you commit to — attendance is not a substitute for output, and output is not an excuse to disappear.",
      "Be reachable and responsive on Company communication channels during your working day. If you're stepping away for a while during work hours, a quick heads-up to your team is common courtesy, not a formality to fill in.",
      "Remote, hybrid and on-site working arrangements are agreed with your reporting manager based on role requirements. Whatever the mode, show up prepared, on time for scheduled calls, and with your camera on for team meetings unless otherwise agreed.",
      "Consistently missing commitments, being unreachable during working hours without notice, or irregular attendance will be addressed directly with you and, if unresolved, through the Company's disciplinary process.",
    ],
  },
  {
    id: "leave",
    title: "3. Leave Policy",
    body: [
      "Sundays are a weekly holiday for all employees.",
      "All public holidays declared by the Government of Tamil Nadu are observed as Company holidays, in addition to Sundays.",
      "A set of optional/restricted holidays (regional and festival holidays that vary by location) is published at the start of each year. You may choose the optional holidays applicable to your region or preference, subject to your manager's approval and business needs; this list may be revised periodically as our team's locations grow.",
      "Paid leave (casual, sick and earned/privilege leave) is credited and accrued as per the Company's leave policy and the Shops and Establishments Act of the state you are based in. Unused earned leave may be carried forward or encashed as per that policy.",
      "Apply for planned leave with as much advance notice as possible through the process communicated by HR. For unplanned leave (illness, emergencies), inform your manager at the earliest opportunity.",
      "Interns and part-time associates are governed by the leave terms (if any) stated in their specific offer letter, which take precedence over this general policy for that engagement.",
    ],
  },
  {
    id: "confidentiality",
    title: "4. Confidentiality & Data Protection",
    body: [
      "In the course of your work, you may access confidential information belonging to Sloud Solutions, our clients, or our partners — including business plans, pricing, source code, credentials, personal data and any other non-public information. Treat all such information as strictly confidential, whether or not it is explicitly marked so.",
      "Use confidential information only for the purpose it was shared for. Do not disclose, copy, publish, or discuss it — including on personal social media or with friends and family — without proper authorisation.",
      "Personal data of employees, candidates, clients and their end-users must be collected, stored, and processed only as necessary for legitimate business purposes, in line with the Digital Personal Data Protection Act, 2023 and any other applicable data protection law. Access it only if your role requires it, and never move it to personal devices, personal email, or unapproved storage/cloud accounts.",
      "Use only Company-approved systems, accounts and tools for Company and client work. Keep your passwords and access credentials confidential, enable multi-factor authentication where available, and report any suspected data breach, lost device, or compromised account immediately — quick reporting matters more than avoiding blame.",
      "All work product created during your engagement with Sloud Solutions — code, documents, designs, and other deliverables — belongs to the Company or the relevant client, as set out in your offer letter or contract.",
      "These obligations continue after your employment, engagement or internship with Sloud Solutions ends, for the period specified in your offer letter.",
    ],
  },
  {
    id: "internships",
    title: "5. Internship Guidelines",
    body: [
      "Our internships are structured as genuine learning and training opportunities, not just an extra pair of hands — you'll be assigned a mentor, clear tasks, and regular feedback throughout your term.",
      "Every intern is assigned lead-generation or project assignments as part of the internship curriculum. These are training exercises designed to build real business skills (research, outreach, communication, problem-solving) — treat them with the same seriousness as any paid work, even though the underlying purpose is learning, not billable output.",
      "Completion of your assigned work is a condition for satisfactory completion of the internship and for the issuance of your completion certificate. Consistent non-completion without valid reason may result in early closure of the internship.",
      "Your mentor will review your work and provide feedback at regular intervals — use this actively; the more you engage, the more you'll take away from the experience.",
      "An internship at Sloud Solutions is a period of training and does not by itself create an employment relationship, guarantee a future job offer, or entitle you to employee benefits — the specific terms of your internship are set out in your internship letter.",
    ],
  },
  {
    id: "posh",
    title: "6. Prevention of Sexual Harassment (POSH)",
    body: [
      "Sloud Solutions is committed to providing a safe, respectful and inclusive workplace for everyone, in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.",
      "Sexual harassment in any form — physical, verbal, or non-verbal, in person or online — is strictly prohibited and will result in disciplinary action, up to and including termination, regardless of the seniority of the person involved.",
      "Any employee, intern, contractor, client representative or visitor who experiences or witnesses such conduct at the workplace, at a work-related event, or in any work-related online interaction, is encouraged to report it without fear of retaliation.",
      "Complaints may be raised in confidence with HR at info@sloudsolutions.com, and will be handled in accordance with the Act and the Company's internal policy, including timely and impartial redressal.",
      "As our team grows, an Internal Committee (IC) will be constituted as required under the Act; until then, HR serves as the point of contact for all POSH-related concerns.",
    ],
  },
  {
    id: "equal-opportunity",
    title: "7. Equal Opportunity & Anti-Discrimination",
    body: [
      "Sloud Solutions is an equal opportunity employer. Hiring, promotion, compensation and all other employment decisions are based on merit, skills and business needs, without regard to gender, religion, caste, disability, marital status, or any other protected characteristic.",
      "We are committed to making reasonable workplace accommodations for persons with disabilities, in line with the Rights of Persons with Disabilities Act, 2016.",
    ],
  },
  {
    id: "it-acceptable-use",
    title: "8. IT, Data Security & Acceptable Use",
    body: [
      "Company-provided systems, accounts, email and software licences are provided for work purposes. Reasonable, incidental personal use is fine, but should never compromise security, productivity, or Company/client data.",
      "Do not install unauthorised or unlicensed software, disable security controls, or connect unapproved personal devices/storage to Company or client systems and networks.",
      "Report phishing attempts, suspicious emails, malware, or any other security incident to IT/HR as soon as you notice it.",
      "On separation from the Company, all Company property, accounts, devices and access must be returned or deactivated as part of exit formalities.",
    ],
  },
  {
    id: "health-safety",
    title: "9. Health, Safety & Wellbeing",
    body: [
      "The Company is committed to a healthy and safe working environment, whether you work on-site, remotely, or in a hybrid mode.",
      "Take reasonable care of your own health and safety and that of others, and report any workplace hazard, accident, or safety concern promptly.",
      "We encourage a healthy work-life balance — regular breaks, use of your leave entitlement, and speaking up early if workload or wellbeing becomes a concern, rather than burning out silently.",
    ],
  },
  {
    id: "grievance-redressal",
    title: "10. Grievance Redressal",
    body: [
      "If you have a concern about your work, your manager, compensation, or any Company policy, raise it first with your reporting manager. If it's not resolved, or not appropriate to raise with them, escalate it to HR at info@sloudsolutions.com.",
      "All grievances are handled confidentially, fairly, and without any adverse action against the person raising them in good faith.",
    ],
  },
  {
    id: "anti-bribery",
    title: "11. Anti-Bribery & Conflict of Interest",
    body: [
      "Do not offer, give, solicit or accept any bribe, kickback, or improper advantage to or from a client, vendor, government official, or any other party in connection with Company business.",
      "Gifts or hospitality of nominal, customary value may be accepted or given in the normal course of business; anything beyond that should be declined or disclosed to HR before acceptance.",
      "Disclose any outside business interest, directorship, or relationship (including with a competitor, client, or vendor) that could reasonably be seen to conflict with your duties to the Company.",
    ],
  },
  {
    id: "exit-policy",
    title: "12. Exit & Separation Policy",
    body: [
      "Resignation, retirement, or termination of employment/engagement is governed by the notice period and process stated in your offer letter.",
      "On separation, complete the exit formalities communicated by HR — knowledge transfer, return of Company property (laptop, access cards, documents), and deactivation of accounts and access.",
      "Full and final settlement, including any dues or deductions, is processed after successful completion of exit formalities and clearance.",
    ],
  },
  {
    id: "amendments",
    title: "13. Policy Amendments",
    body: [
      "This policy is reviewed periodically and may be amended by the Company from time to time to reflect changes in law, business needs, or good HR practice. The current version in force supersedes all earlier versions and any informal understanding on the same subject.",
      "Nothing in this policy overrides a specific written term in your individual offer letter or contract; where the two conflict, your offer letter governs for that matter.",
      "This policy is a general guide and does not constitute legal advice. Questions on any section here should be directed to HR at info@sloudsolutions.com.",
    ],
  },
];
