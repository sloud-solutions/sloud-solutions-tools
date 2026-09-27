// Cognito-backed auth. Session tokens live in sessionStorage (cleared on tab
// close, same lifetime as the old placeholder), under the same key it used.
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

const SESSION_KEY = "sloud:session";

const pool = new CognitoUserPool({
  UserPoolId: import.meta.env.PUBLIC_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.PUBLIC_COGNITO_CLIENT_ID,
});

interface SessionTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  /** Epoch ms; matches the ID token's own expiry. */
  expiresAt: number;
}

function loadSession(): SessionTokens | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionTokens) : null;
  } catch {
    return null;
  }
}

function saveSession(tokens: SessionTokens) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(tokens));
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

function toTokens(session: CognitoUserSession): SessionTokens {
  return {
    idToken: session.getIdToken().getJwtToken(),
    accessToken: session.getAccessToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
    expiresAt: session.getIdToken().getExpiration() * 1000,
  };
}

export function isLoggedIn(): boolean {
  const session = loadSession();
  return !!session && session.expiresAt > Date.now();
}

/** Used by the API client to attach `Authorization: Bearer <idToken>`. */
export function getIdToken(): string | null {
  const session = loadSession();
  if (!session || session.expiresAt <= Date.now()) return null;
  return session.idToken;
}

export interface LoginResult {
  ok: boolean;
  /** Set when Cognito requires a new password before login can complete (first login for an admin-created user). */
  challenge?: "NEW_PASSWORD_REQUIRED";
  message?: string;
}

// Held between `login()` returning a NEW_PASSWORD_REQUIRED challenge and the
// follow-up `completeNewPassword()` call on the same login page.
let pendingUser: CognitoUser | null = null;

export function login(username: string, password: string): Promise<LoginResult> {
  return new Promise((resolve) => {
    const user = new CognitoUser({ Username: username, Pool: pool });
    // The User Pool Client only allows USER_PASSWORD_AUTH (see the Terraform
    // cognito-user-pool module) — without this, the SDK defaults to SRP, which
    // that client isn't configured for, and every login fails.
    user.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    const details = new AuthenticationDetails({ Username: username, Password: password });
    user.authenticateUser(details, {
      onSuccess: (session) => {
        saveSession(toTokens(session));
        resolve({ ok: true });
      },
      onFailure: (err) => {
        resolve({ ok: false, message: err?.message ?? "Incorrect username or password." });
      },
      newPasswordRequired: () => {
        pendingUser = user;
        resolve({ ok: false, challenge: "NEW_PASSWORD_REQUIRED" });
      },
    });
  });
}

/** Second step for a newly admin-created user's first login. */
export function completeNewPassword(newPassword: string): Promise<LoginResult> {
  return new Promise((resolve) => {
    if (!pendingUser) {
      resolve({ ok: false, message: "That took too long — please log in again." });
      return;
    }
    pendingUser.completeNewPasswordChallenge(
      newPassword,
      {},
      {
        onSuccess: (session) => {
          saveSession(toTokens(session));
          pendingUser = null;
          resolve({ ok: true });
        },
        onFailure: (err) => {
          resolve({ ok: false, message: err?.message ?? "Could not set the new password." });
        },
      },
    );
  });
}

export function logout(): void {
  pool.getCurrentUser()?.signOut();
  clearSession();
}

/** Redirects to the login page when there is no session; returns whether the page may render. */
export function requireLogin(): boolean {
  if (isLoggedIn()) return true;
  location.replace(`/login?next=${encodeURIComponent(location.pathname)}`);
  return false;
}
