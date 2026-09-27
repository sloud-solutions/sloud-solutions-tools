// Server-side only (build/dev): reads the offerletter/ folder tree.
// Each subfolder is an employment type; the first .docx inside is its template.
import fs from "node:fs";
import path from "node:path";

const OFFER_DIR = path.join(process.cwd(), "offerletter");

export interface OfferType {
  folder: string;
  label: string;
  templateFile: string | null;
}

export function labelFromFolder(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function listOfferTypes(): OfferType[] {
  if (!fs.existsSync(OFFER_DIR)) return [];
  return fs
    .readdirSync(OFFER_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(OFFER_DIR, entry.name);
      const docx = fs
        .readdirSync(dir)
        .find((file) => file.toLowerCase().endsWith(".docx") && !file.startsWith("~$") && !file.startsWith("_"));
      return {
        folder: entry.name,
        label: labelFromFolder(entry.name),
        templateFile: docx ? path.join(dir, docx) : null,
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder));
}
