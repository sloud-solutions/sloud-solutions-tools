// Client-side: fills a .docx offer-letter template from form values.
// Template placeholders are literal "[...]" text inside word/document.xml.
import JSZip from "jszip";

export type FormValues = Record<string, string>;

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
];

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

type Rule = [pattern: RegExp, replacement: string | (() => string)];

// One rule builder per template folder name (offerletter/<folder>/).
export const TEMPLATE_RULES: Record<string, (v: FormValues) => Rule[]> = {
  internship(v) {
    const months = monthsBetween(v.startDate, v.endDate);
    const seq = pad2(Number(v.refNo) || 0);
    const year = parseIso(v.letterDate).getFullYear();

    const mode =
      v.mode === "On-site" ? `On-site at ${v.location}` : v.mode === "Hybrid" && v.location ? `Hybrid (${v.location})` : v.mode;

    const stipend =
      v.stipendType === "paid"
        ? `INR ${Number(v.stipendAmount).toLocaleString("en-IN")} per month, payable by ${ordinal(Number(v.payDay))} of the following month`
        : "Nil – this is an unpaid internship";

    const notice = Number(v.noticeDays);
    const noticeText = `${NUMBER_WORDS[notice] ?? notice} (${notice})`;


    // Mentor is the first "[Name], [Designation]" in the template, signatory the second.
    const people = [`${v.mentorName}, ${v.mentorDesignation}`, `${v.signatoryName}, ${v.signatoryDesignation}`];
    let personIndex = 0;

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
      [/\[Role Title\]/g, v.roleTitle],
      [/\[Function or team\]/g, v.team],
      [/\[DD\.MM\.YYYY\] to \[DD\.MM\.YYYY\] \(\[number\] months\)/g, `${dotDate(v.startDate)} to ${dotDate(v.endDate)} (${months} ${months === 1 ? "month" : "months"})`],
      [/\[Remote \/ Hybrid \/ On-site at \[location\]\]/g, mode],
      [/Approximately \[number\] hours/g, `Approximately ${v.hoursPerWeek} hours`],
      [/\[Name\], \[Designation\]/g, () => people[personIndex++] ?? ""],
      [/\[Nil [^\]]*\] \/ \[INR \[amount\] per month, payable by \[date\] of the following month\]/g, stipend],
      [/\[seven \(7\)\]/g, noticeText],
      [/\[Name \/ designated person or Internal Committee\] at \[email\]/g, `${v.poshName} at ${v.poshEmail}`],
      [/\[City, State\]/g, v.jurisdiction],
      [/on or before \[date\]/g, `on or before ${longDate(v.acceptBy)}`],
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
