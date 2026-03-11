export interface SessionEntry {
  id: string;
  label: string;
  loginTime: string;
  lastSeen: string;
  active: boolean;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  detail: string;
}

export interface PaymentRequest {
  id: string;
  description: string;
  amount: number;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
}

const SESSIONS_KEY = "lema_sessions";
const AUDIT_KEY = "lema_audit_log";
const ANNOUNCEMENT_KEY = "lema_announcement";
const LOCKED_KEY = "lema_portal_locked";
const PAYMENT_REQUESTS_KEY = "lema_payment_requests";
const LOCKOUT_ATTEMPTS_KEY = "lema_login_attempts";
const LOCKOUT_UNTIL_KEY = "lema_lockout_until";
const LAST_LOGIN_KEY = "lema_last_login";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getSessions(): SessionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function registerSession(label: string): SessionEntry {
  const sessions = getSessions();
  const entry: SessionEntry = {
    id: uid(),
    label,
    loginTime: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    active: true,
  };
  sessions.push(entry);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return entry;
}

export function terminateSession(id: string): void {
  const sessions = getSessions().map((s) =>
    s.id === id ? { ...s, active: false } : s,
  );
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function updateLastSeen(id: string): void {
  const sessions = getSessions().map((s) =>
    s.id === id ? { ...s, lastSeen: new Date().toISOString() } : s,
  );
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function isSessionActive(id: string): boolean {
  const session = getSessions().find((s) => s.id === id);
  return session?.active ?? false;
}

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addAuditEntry(action: string, detail: string): void {
  const log = getAuditLog();
  log.push({ timestamp: new Date().toISOString(), action, detail });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_KEY);
}

export function getAnnouncement(): string {
  return localStorage.getItem(ANNOUNCEMENT_KEY) ?? "";
}

export function setAnnouncement(text: string): void {
  localStorage.setItem(ANNOUNCEMENT_KEY, text);
}

export function clearAnnouncement(): void {
  localStorage.removeItem(ANNOUNCEMENT_KEY);
}

export function isPortalLocked(): boolean {
  return localStorage.getItem(LOCKED_KEY) === "true";
}

export function lockPortal(): void {
  localStorage.setItem(LOCKED_KEY, "true");
}

export function unlockPortal(): void {
  localStorage.removeItem(LOCKED_KEY);
}

export function getPaymentRequests(): PaymentRequest[] {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_REQUESTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addPaymentRequest(
  req: Omit<PaymentRequest, "id" | "requestedAt" | "status">,
): PaymentRequest {
  const requests = getPaymentRequests();
  const entry: PaymentRequest = {
    ...req,
    id: uid(),
    requestedAt: new Date().toISOString(),
    status: "pending",
  };
  requests.push(entry);
  localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(requests));
  return entry;
}

export function updatePaymentRequest(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
): void {
  const requests = getPaymentRequests().map((r) =>
    r.id === id ? { ...r, status, adminNote } : r,
  );
  localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(requests));
}

// --- Lockout helpers ---
export function getLoginAttempts(): number {
  return Number.parseInt(localStorage.getItem(LOCKOUT_ATTEMPTS_KEY) ?? "0", 10);
}

export function incrementLoginAttempts(): number {
  const n = getLoginAttempts() + 1;
  localStorage.setItem(LOCKOUT_ATTEMPTS_KEY, String(n));
  return n;
}

export function resetLoginAttempts(): void {
  localStorage.removeItem(LOCKOUT_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);
}

export function getLockoutUntil(): number {
  return Number.parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) ?? "0", 10);
}

export function setLockoutUntil(ts: number): void {
  localStorage.setItem(LOCKOUT_UNTIL_KEY, String(ts));
}

// --- Last login helpers ---
export function getLastLoginTime(): string {
  return localStorage.getItem(LAST_LOGIN_KEY) ?? "";
}

export function setLastLoginTime(): void {
  localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
}

// --- Single session enforcement ---
export function clearAllActiveSessions(): void {
  const sessions = getSessions().map((s) => ({ ...s, active: false }));
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
