import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import * as sessionStore from "./lib/sessionStore";
import CustomerService from "./pages/CustomerService";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import Orders from "./pages/Orders";
import Partners from "./pages/Partners";
import Payments from "./pages/Payments";
import PerfStore from "./pages/PerfStore";
import SellerSubmissions from "./pages/SellerSubmissions";
import SuperAdminPage from "./pages/SuperAdminPage";

export type Page =
  | "dashboard"
  | "orders"
  | "partners"
  | "submissions"
  | "payments"
  | "customerservice"
  | "perfstore"
  | "superadmin";

const INACTIVITY_WARN_MS = 28 * 60 * 1000; // 28 min
const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000; // 30 min
const SESSION_CHECK_INTERVAL_MS = 30 * 1000; // 30 sec

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => sessionStorage.getItem("lema_session") === "true",
  );
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(120); // 2 min in seconds

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const handleLogout = useCallback(() => {
    const sessionId = sessionStorage.getItem("lema_session_id");
    if (sessionId) sessionStore.terminateSession(sessionId);
    sessionStore.addAuditEntry("logout", "Admin signed out");
    sessionStorage.removeItem("lema_session");
    sessionStorage.removeItem("lema_session_id");
    setIsLoggedIn(false);
    setShowTimeoutWarning(false);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    setShowTimeoutWarning(false);

    warnTimerRef.current = setTimeout(() => {
      setWarningCountdown(120);
      setShowTimeoutWarning(true);
      countdownIntervalRef.current = setInterval(() => {
        setWarningCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current)
              clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_WARN_MS);

    inactivityTimerRef.current = setTimeout(() => {
      sessionStore.addAuditEntry("logout", "Auto-logged out due to inactivity");
      handleLogout();
    }, INACTIVITY_LOGOUT_MS);
  }, [handleLogout]);

  // Attach inactivity listeners
  useEffect(() => {
    if (!isLoggedIn) return;
    resetInactivityTimer();
    const events = ["mousemove", "keydown", "click", "scroll"] as const;
    const handler = () => resetInactivityTimer();
    for (const e of events) window.addEventListener(e, handler);
    return () => {
      for (const e of events) window.removeEventListener(e, handler);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [isLoggedIn, resetInactivityTimer]);

  // Periodic single-session check
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      const sessionId = sessionStorage.getItem("lema_session_id");
      if (sessionId && !sessionStore.isSessionActive(sessionId)) {
        sessionStore.addAuditEntry(
          "logout",
          "Session terminated externally (force-logout)",
        );
        sessionStorage.removeItem("lema_session");
        sessionStorage.removeItem("lema_session_id");
        setIsLoggedIn(false);
        setShowTimeoutWarning(false);
      }
    }, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem("lema_session", "true");
    // Session ID is set in LoginPage after clearAllActiveSessions + registerSession
    // If it wasn't set (e.g. old code path), register now
    if (!sessionStorage.getItem("lema_session_id")) {
      sessionStore.clearAllActiveSessions();
      const session = sessionStore.registerSession("Admin User");
      sessionStorage.setItem("lema_session_id", session.id);
      sessionStore.addAuditEntry("login", "Admin logged in");
    }
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout currentPage={page} onNavigate={setPage} onLogout={handleLogout}>
        {page === "dashboard" && <Dashboard />}
        {page === "orders" && <Orders />}
        {page === "partners" && <Partners />}
        {page === "submissions" && <SellerSubmissions />}
        {page === "payments" && <Payments />}
        {page === "customerservice" && <CustomerService />}
        {page === "perfstore" && <PerfStore />}
        {page === "superadmin" && <SuperAdminPage />}
      </Layout>

      {/* Session timeout warning dialog */}
      <AlertDialog open={showTimeoutWarning}>
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="timeout.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <span className="text-amber-400">⏱</span> Session Expiring Soon
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You have been inactive for 28 minutes. For security, you will be
              automatically logged out in{" "}
              <span className="font-bold text-amber-400 tabular-nums">
                {Math.floor(warningCountdown / 60)}:
                {String(warningCountdown % 60).padStart(2, "0")}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleLogout}
              className="border-border text-muted-foreground hover:bg-muted"
              data-ocid="timeout.logout_button"
            >
              Log Out Now
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={resetInactivityTimer}
              className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground"
              data-ocid="timeout.stay_button"
            >
              Stay Logged In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  );
}
