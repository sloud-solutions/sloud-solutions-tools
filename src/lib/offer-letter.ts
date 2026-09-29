// Client-side: fills a .docx offer-letter template from form values.
// Template placeholders are literal "[...]" text inside word/document.xml.
import JSZip from "jszip";
import { COMPANY } from "../data/company";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Builds a global regex that matches a literal bracketed placeholder string as-is. */
const literal = (s: string) => new RegExp(escapeRegExp(s), "g");

export type FormValues = Record<string, string>;

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parseIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const pad2 = (n: number) => String(n).padStart(2, "0");
const longDate = (iso: string) => {
  const d = parseIso(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const dotDate = (iso: string) => {
  const d = parseIso(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
};
const monthsBetween = (startIso: string, endIso: string) => {
  const days = (parseIso(endIso).getTime() - parseIso(startIso).getTime()) / 86_400_000 + 1;
  return Math.max(1, Math.round(days / 30.44));
};
const ordinal = (n: number) => {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
};

const inr = (n: number) => Number(n || 0).toLocaleString("en-IN");

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigitWords = (n: number): string => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`);
const threeDigitWords = (n: number): string => {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return `${hundreds ? `${ONES[hundreds]} Hundred${rest ? " " : ""}` : ""}${rest ? twoDigitWords(rest) : ""}`;
};
/** Indian numbering (crore/lakh/thousand) — used for CTC-in-words on the full-time letter. */
const numberToWordsIndian = (n: number): string => {
  n = Math.round(n);
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1e3);
  n %= 1e3;
  const hundred = n;
  const parts = [
    crore && `${threeDigitWords(crore)} Crore`,
    lakh && `${threeDigitWords(lakh)} Lakh`,
    thousand && `${threeDigitWords(thousand)} Thousand`,
    hundred && threeDigitWords(hundred),
  ].filter(Boolean);
  return parts.join(" ");
};

type Rule = [pattern: RegExp, replacement: string | (() => string)];

// One rule builder per template folder name (offerletter/<folder>/).
export const TEMPLATE_RULES: Record<string, (v: FormValues) => Rule[]> = {
  internship(v) {
    const months = monthsBetween(v.startDate, v.endDate);
    const seq = pad2(Number(v.refNo) || 0);
    const year = parseIso(v.letterDate).getFullYear();

    const mode =
      v.mode === "On-site" ? `On-site at ${v.location}, Tamil Nadu` : v.mode === "Hybrid" && v.location ? `Hybrid (${v.location}), Tamil Nadu` : `${v.mode}, Tamil Nadu`;

    const roleTitle = `Trainee Intern – ${v.specialist}`;
    const subjectLine = v.subjectLine?.trim() || `Offer of Unpaid Training Internship – ${roleTitle}`;

    return [
      // Company header
      [/\[Registered address, City\]/g, v.companyAddress],
      [/\[PIN\]/g, v.companyPIN],
      [/\[UDYAM-TN-00-0000000\]/g, v.companyRegNo?.trim() || "Not yet registered"],
      [/\[if registered\]/g, v.companyGstin?.trim() || "Not applicable"],
      [/\[Proprietor Name\]/g, COMPANY.proprietorName],
      [literal("[email]"), COMPANY.email],

      // Letter identity
      [/\[YYYY\]/g, String(year)],
      [/\[NN\]/g, seq],
      [/\[DD Month YYYY\]/g, longDate(v.letterDate)],
      [literal("[Subject Line]"), subjectLine],

      // Candidate
      [/\[Candidate Name\]/g, v.candidateName],
      [/\[Address, City, State, PIN\]/g, v.candidateAddress],
      [/\[Email\]/g, v.candidateEmail],
      [/\[Phone\]/g, v.candidatePhone || "@@REMOVE@@"],

      // Role and particulars
      [literal("[Specialist Area]"), v.specialist],
      [/\[Function or team\]/g, v.team],
      [literal("[DD.MM.YYYY] to [DD.MM.YYYY] ([3] months)"), `${dotDate(v.startDate)} to ${dotDate(v.endDate)} (${months} ${months === 1 ? "month" : "months"})`],
      [literal("[Remote / Hybrid / On-site at [location], Tamil Nadu]"), mode],
      [literal("not more than [30] hours a week"), `not more than ${v.hoursPerWeek} hours a week`],
      [/\[Name\], \[Designation\]/g, `${v.mentorName}, ${v.mentorDesignation}`],

      // Jurisdiction / governing law / POSH Local Committee district
      [literal("[City]"), v.jurisdiction],
      [literal("[District]"), v.jurisdiction],

      // Acceptance
      [/by \[date\]/g, `by ${longDate(v.acceptBy)}`],

      // Annexure A1 — role/learning-objectives block (defaults to the reference
      // template's own example text; each is an editable form field)
      [literal("[Two or three lines on what the trainee will learn to do]"), v.roleSummary],
      [literal("[Objective – e.g., plan and run a social media content calendar]"), v.objective1],
      [literal("[Objective – e.g., do structured market research and present findings]"), v.objective2],
      [literal("[Objective – e.g., use CRM / analytics / cloud tools confidently]"), v.objective3],
      [literal("[List of tools, platforms and methods]"), v.toolsAndMethods],
    ];
  },

  "full-time"(v) {
    const year = parseIso(v.letterDate).getFullYear();
    const seq = pad2(Number(v.refNo) || 0);
    const ctc = Number(v.annualCTC) || 0;

    return [
      [/\[Registered address, City, State, PIN\]/g, v.companyAddress],
      [/\[CIN[^\]]*\]/g, v.companyRegNo || "@@REMOVE@@"],
      [/\[YYYY\]/g, String(year)],
      [/\[NN\]/g, seq],
      [/\[DD Month YYYY\]/g, longDate(v.letterDate)],
      [/\[Candidate Name\]/g, v.candidateName],
      [/\[Address, City, State, PIN\]/g, v.candidateAddress],
      [/\[Email\]/g, v.candidateEmail],
      [/\[Phone\]/g, v.candidatePhone || "@@REMOVE@@"],
      [/\[Designation\]/g, v.designation],
      [/\[Department\]/g, v.department],
      [/\[Reporting Manager Name\], \[Reporting Manager Designation\]/g, `${v.reportingManagerName}, ${v.reportingManagerDesignation}`],
      [/\[Date of Joining, DD Month YYYY\]/g, longDate(v.dateOfJoining)],
      [/\[Work Location\]/g, v.workLocation],
      [/\[Working Days and Hours\]/g, v.workingDaysHours],
      [/\[Probation Period Months\]/g, v.probationMonths],
      [/\[Notice Period During Probation Days\]/g, v.noticeDuringProbationDays],
      [/\[Notice Period After Confirmation Days\]/g, v.noticeAfterConfirmationDays],
      [/\[Leave Entitlement Days\]/g, v.leaveEntitlementDays],
      [/\[Annual CTC in Words\]/g, `${numberToWordsIndian(ctc)} Rupees`],
      [/\[Annual CTC\]/g, inr(ctc)],
      [/\[Basic Amount\]/g, inr(Number(v.basicAmount))],
      [/\[HRA Amount\]/g, inr(Number(v.hraAmount))],
      [/\[Special Allowance Amount\]/g, inr(Number(v.specialAllowanceAmount))],
      [/\[Other Allowances Amount\]/g, inr(Number(v.otherAllowancesAmount))],
      [/\[Employer PF Amount\]/g, inr(Number(v.employerPfAmount))],
      [/\[Gratuity Provision Amount\]/g, inr(Number(v.gratuityProvisionAmount))],
      [/\[POSH Contact Name\]/g, v.poshName],
      [/\[POSH Contact Email\]/g, v.poshEmail],
      [/\[Jurisdiction City, State\]/g, v.jurisdiction],
      [/\[Acceptance Due Date, DD Month YYYY\]/g, longDate(v.acceptBy)],
      [/\[Signatory Name\], \[Signatory Designation\]/g, `${v.signatoryName}, ${v.signatoryDesignation}`],
    ];
  },

  "part-time"(v) {
    const year = parseIso(v.letterDate).getFullYear();
    const seq = pad2(Number(v.refNo) || 0);
    const guaranteed = v.hoursGuaranteed === "guaranteed";
    const rateUnit = v.compensationUnit || "hour";
    const compensation = `INR ${inr(Number(v.compensationRate))} per ${rateUnit}`;

    return [
      [/\[Registered address, City, State, PIN\]/g, v.companyAddress],
      [/\[CIN[^\]]*\]/g, v.companyRegNo || "@@REMOVE@@"],
      [/\[YYYY\]/g, String(year)],
      [/\[NN\]/g, seq],
      [/\[DD Month YYYY\]/g, longDate(v.letterDate)],
      [/\[Candidate Name\]/g, v.candidateName],
      [/\[Address, City, State, PIN\]/g, v.candidateAddress],
      [/\[Email\]/g, v.candidateEmail],
      [/\[Phone\]/g, v.candidatePhone || "@@REMOVE@@"],
      [/\[Designation\]/g, v.designation],
      [/\[Reporting Manager Name\], \[Reporting Manager Designation\]/g, `${v.reportingManagerName}, ${v.reportingManagerDesignation}`],
      [/\[Start Date, DD Month YYYY\]/g, longDate(v.startDate)],
      [/\[Work Location\]/g, v.workLocation],
      [/\[Fixed Days and Hours Per Week\]/g, v.fixedDaysHours],
      [/\[Guaranteed \/ Variable, subject to work available\]/g, guaranteed ? "Guaranteed" : "Variable, subject to work available"],
      [/\[Compensation Rate and Basis\], payable on \[Payment Date\] of the following month/g, `${compensation}, payable on the ${ordinal(Number(v.paymentDay))} of the following month`],
      [/\[Notice Period Days\]/g, v.noticeDays],
      [/\[POSH Contact Name\]/g, v.poshName],
      [/\[POSH Contact Email\]/g, v.poshEmail],
      [/\[Jurisdiction City, State\]/g, v.jurisdiction],
      [/\[Acceptance Due Date, DD Month YYYY\]/g, longDate(v.acceptBy)],
      [/\[Signatory Name\], \[Signatory Designation\]/g, `${v.signatoryName}, ${v.signatoryDesignation}`],
    ];
  },
};

export function hasTemplateRules(type: string): boolean {
  return type in TEMPLATE_RULES;
}

// Drops whole paragraphs whose optional value was left blank.
function removeBlankOptionals(xml: string): string {
  return xml.replace(/<w:p[ >].*?<\/w:p>/gs, (para) => (para.includes("@@REMOVE@@") ? "" : para));
}

function removeTemplateDisclaimer(xml: string): string {
  return xml.replace(/<w:p[ >].*?<\/w:p>/gs, (para) => (para.includes("This document is a template") ? "" : para));
}

function visibleText(xml: string): string {
  return [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("\n");
}

export interface GeneratedLetter {
  blob: Blob;
  /** Placeholders still present after filling (should be empty). */
  leftovers: string[];
}

export async function generateLetter(type: string, templateBuffer: ArrayBuffer, values: FormValues): Promise<GeneratedLetter> {
  const buildRules = TEMPLATE_RULES[type];
  if (!buildRules) throw new Error(`No template rules for "${type}".`);

  const zip = await JSZip.loadAsync(templateBuffer);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("Template is not a valid .docx (word/document.xml missing).");

  const escaped = Object.fromEntries(Object.entries(values).map(([k, val]) => [k, xmlEscape(val.trim())]));

  let xml = await docFile.async("string");
  for (const [pattern, replacement] of buildRules(escaped)) {
    xml = xml.replace(pattern, typeof replacement === "function" ? replacement : () => replacement);
  }
  xml = removeBlankOptionals(removeTemplateDisclaimer(xml));

  zip.file("word/document.xml", xml);
  const blob = await zip.generateAsync({ type: "blob", mimeType: DOCX_MIME, compression: "DEFLATE" });
  const leftovers = [...visibleText(xml).matchAll(/\[[^\]]*\]/g)].map((m) => m[0]);
  return { blob, leftovers };
}
