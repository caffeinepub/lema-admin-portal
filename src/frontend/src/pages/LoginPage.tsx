import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import * as sessionStore from "../lib/sessionStore";

const ADMIN_EMAIL = "Perfstore26@gmail.com";
const ADMIN_PASSWORD = "@Lema2026";
const SECRET_PASSWORD = "@Lenny2004";
const TRUSTED_DEVICE_KEY = "lema_trusted_device";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function formatLastLogin(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [step, setStep] = useState<"credentials" | "secret">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretPassword, setSecretPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Lockout state
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(() =>
    sessionStore.getLoginAttempts(),
  );

  // Check lockout on mount and tick countdown
  useEffect(() => {
    function checkLockout() {
      const until = sessionStore.getLockoutUntil();
      const remaining = until - Date.now();
      setLockoutRemaining(remaining > 0 ? remaining : 0);
    }
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLockedOut = lockoutRemaining > 0;
  const lastLogin = sessionStore.getLastLoginTime();
  const isTrustedDevice = () =>
    localStorage.getItem(TRUSTED_DEVICE_KEY) === "true";

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (sessionStore.isPortalLocked()) {
      setError("Portal is currently locked by the super admin.");
      return;
    }

    if (isLockedOut) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      sessionStore.resetLoginAttempts();
      setAttempts(0);
      sessionStore.setLastLoginTime();
      if (isTrustedDevice()) {
        sessionStore.clearAllActiveSessions();
        const session = sessionStore.registerSession("Admin User");
        sessionStorage.setItem("lema_session_id", session.id);
        sessionStore.addAuditEntry(
          "login",
          "Admin logged in from trusted device",
        );
        onLoginSuccess();
      } else {
        setStep("secret");
      }
    } else {
      const newAttempts = sessionStore.incrementLoginAttempts();
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        sessionStore.setLockoutUntil(until);
        setLockoutRemaining(LOCKOUT_DURATION_MS);
        sessionStore.addAuditEntry(
          "security",
          `Login locked after ${MAX_ATTEMPTS} failed attempts`,
        );
        setError("");
      } else {
        setError("Invalid email or password.");
      }
    }
    setLoading(false);
  };

  const handleSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (secretPassword === SECRET_PASSWORD) {
      localStorage.setItem(TRUSTED_DEVICE_KEY, "true");
      sessionStore.clearAllActiveSessions();
      const session = sessionStore.registerSession("Admin User");
      sessionStorage.setItem("lema_session_id", session.id);
      sessionStore.addAuditEntry(
        "login",
        "Admin logged in from new device (confirmed)",
      );
      onLoginSuccess();
    } else {
      setError("Incorrect admin confirmation password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-xl shadow-card p-8 space-y-6">
          {/* Lockout screen */}
          {isLockedOut ? (
            <div
              className="text-center space-y-5"
              data-ocid="login.lockout_state"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15 mx-auto">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Access Temporarily Locked
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Too many failed attempts. Please wait before trying again.
                </p>
              </div>
              <div className="py-4 px-6 rounded-xl bg-destructive/10 border border-destructive/25">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Try again in
                </p>
                <p className="text-4xl font-mono font-bold text-destructive tabular-nums">
                  {formatCountdown(lockoutRemaining)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                If you believe this is an error, contact your super admin.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-sidebar mx-auto">
                  {step === "secret" ? (
                    <Lock className="h-7 w-7 text-sidebar-primary" />
                  ) : (
                    <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    Lema Admin Portal
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {step === "secret"
                      ? "New device detected — admin confirmation required"
                      : "Secure access for administrators only"}
                  </p>
                  {step === "credentials" && lastLogin && (
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      Last login: {formatLastLogin(lastLogin)}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-border" />

              {step === "credentials" ? (
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      data-ocid="login.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="pr-10"
                        data-ocid="login.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Attempts warning */}
                  {attempts >= 3 && attempts < MAX_ATTEMPTS && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm"
                      data-ocid="login.attempts_warning"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>
                        {MAX_ATTEMPTS - attempts} attempt
                        {MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining
                        before lockout
                      </span>
                    </div>
                  )}

                  {error && (
                    <p
                      className="text-sm text-destructive"
                      data-ocid="login.error_state"
                    >
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold h-11"
                    data-ocid="login.primary_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSecret} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This device has not been verified before. Please enter the
                    admin secret password to confirm access.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="secret">Admin Confirmation Password</Label>
                    <div className="relative">
                      <Input
                        id="secret"
                        type={showSecret ? "text" : "password"}
                        placeholder="Enter admin secret password"
                        value={secretPassword}
                        onChange={(e) => setSecretPassword(e.target.value)}
                        required
                        autoComplete="off"
                        className="pr-10"
                        autoFocus
                        data-ocid="login.secret_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p
                      className="text-sm text-destructive"
                      data-ocid="login.secret_error_state"
                    >
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold h-11"
                    data-ocid="login.confirm_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Verifying...
                      </>
                    ) : (
                      "Confirm Access"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setError("");
                      setSecretPassword("");
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                  >
                    Back to login
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Access is restricted to authorized administrators.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
