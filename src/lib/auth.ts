// PLACEHOLDER auth: a UI-only stand-in until a real backend (e.g. Cognito) exists.
// The credentials below ship in the browser bundle, so this protects nothing.
const SESSION_KEY = "sloud:session";

export const DEMO_CREDENTIALS = { username: "admin", password: "sloud@123" } as const;

export function isLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function login(username: string, password: string): boolean {
  const ok = username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;
  if (ok) {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  }
  return ok;
}

export function logout(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

/** Redirects to the login page when there is no session; returns whether the page may render. */
export function requireLogin(): boolean {
  if (isLoggedIn()) return true;
  location.replace(`/login?next=${encodeURIComponent(location.pathname)}`);
  return false;
}
