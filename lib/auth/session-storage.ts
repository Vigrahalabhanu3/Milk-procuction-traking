import { AuthSession } from "./auth.service";

const SESSION_KEY = "dairyflow_auth_session_v1";

export function clearSession(): void {
  try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage may be unavailable. */ }
}

export function saveSession(session: AuthSession): void {
  // Explicit whitelist: never persist passwords, refresh tokens, or extra API properties.
  const { id, name, email, farmer_id, role } = session.user;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      access: session.access, expiresAt: session.expiresAt,
      user: { id, name, email, farmer_id, role },
    }));
  } catch { /* Keep the in-memory session usable if browser storage is blocked. */ }
}

export function restoreSession(): AuthSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    const user = value?.user;
    if (typeof value.access !== "string" || !value.access ||
        typeof value.expiresAt !== "number" || !Number.isFinite(value.expiresAt) ||
        value.expiresAt <= Date.now() || value.expiresAt > Date.now() + 30 * 60 * 1000 ||
        !user || (user.role !== "admin" && user.role !== "farmer") ||
        !(typeof user.id === "number" || typeof user.id === "string") || typeof user.name !== "string" ||
        !(user.email === null || typeof user.email === "string") ||
        !(user.farmer_id === null || typeof user.farmer_id === "string")) {
      clearSession();
      return null;
    }
    return { access: value.access, expiresAt: value.expiresAt,
      user: { id: user.id, name: user.name, email: user.email, farmer_id: user.farmer_id, role: user.role } };
  } catch {
    clearSession();
    return null;
  }
}
