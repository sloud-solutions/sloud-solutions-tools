// Page-level access control. Role/access come from the backend (GET /me),
// which reads Cognito's `cognito:groups` claim for role, and the caller's
// Employees-table row for the per-page access list (Admins get every page
// regardless of that list — see modules/cognito-user-pool + the `me` Lambda).
export const PAGE_KEYS = ["offer-letter", "company-policy", "clients", "expenses", "employees"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  "offer-letter": "Offer Letter",
  "company-policy": "Company Policy",
  clients: "Clients",
  expenses: "Expense Tracker",
  employees: "Employees",
};

export type AccountRole = "Admin" | "Employee";

export interface Me {
  email: string | null;
  role: AccountRole;
  access: PageKey[];
  /** Falls back to the email if no Employees-table row was found (e.g. seed-time Admin). */
  name: string;
}

const CACHE_KEY = "sloud:me";

function readCache(): Me | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Me) : null;
  } catch {
    return null;
  }
}

function writeCache(me: Me) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(me));
  } catch {}
}

export function clearMeCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}

/** Fetches (and caches for this session) the logged-in user's role/access. */
export async function loadMe(): Promise<Me> {
  const cached = readCache();
  if (cached) return cached;
  const { getMe } = await import("./api");
  const me = await getMe();
  writeCache(me);
  return me;
}

export function hasAccess(me: Me, page: PageKey): boolean {
  return me.role === "Admin" || me.access.includes(page);
}
