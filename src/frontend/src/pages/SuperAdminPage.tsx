import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  ShieldAlert,
  Trash2,
  Unlock,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as sessionStore from "../lib/sessionStore";
import type {
  AuditEntry,
  PaymentRequest,
  SessionEntry,
} from "../lib/sessionStore";

const SUPER_ADMIN_PASSWORD = "@Leonardogmers24";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const fmtKES = (v: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    v,
  );

function SessionsTab() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  const refresh = useCallback(() => {
    setSessions(sessionStore.getSessions());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleForceLogout = (id: string, label: string) => {
    sessionStore.terminateSession(id);
    sessionStore.addAuditEntry(
      "session-terminated",
      `Force logged out: ${label}`,
    );
    refresh();
    toast.success(`${label} has been logged out`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sessions.filter((s) => s.active).length} active / {sessions.length}{" "}
          total sessions
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={refresh}
          data-ocid="superadmin.sessions.secondary_button"
        >
          Refresh
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="superadmin.sessions.empty_state"
        >
          <Users className="h-10 w-10 opacity-30" />
          <p>No sessions recorded yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table data-ocid="superadmin.sessions.table">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs uppercase tracking-wider font-semibold">
                  User
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">
                  Logged In
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">
                  Last Seen
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, idx) => (
                <TableRow
                  key={session.id}
                  data-ocid={`superadmin.sessions.item.${idx + 1}`}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="font-medium text-sm">
                    {session.label}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtTime(session.loginTime)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtTime(session.lastSeen)}
                  </TableCell>
                  <TableCell>
                    {session.active ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="opacity-60">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.active && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                        onClick={() =>
                          handleForceLogout(session.id, session.label)
                        }
                        data-ocid={`superadmin.sessions.delete_button.${idx + 1}`}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Force Logout
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function PaymentApprovalsTab() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    id: string;
    desc: string;
  }>({
    open: false,
    id: "",
    desc: "",
  });
  const [adminNote, setAdminNote] = useState("");

  const refresh = useCallback(() => {
    setRequests(sessionStore.getPaymentRequests());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleApprove = (req: PaymentRequest) => {
    sessionStore.updatePaymentRequest(req.id, "approved");
    sessionStore.addAuditEntry(
      "payment-approved",
      `Approved: ${req.description} — ${fmtKES(req.amount)}`,
    );
    refresh();
    toast.success("Payment request approved");
  };

  const handleReject = () => {
    sessionStore.updatePaymentRequest(rejectDialog.id, "rejected", adminNote);
    sessionStore.addAuditEntry(
      "payment-rejected",
      `Rejected: ${rejectDialog.desc}${adminNote ? ` — Note: ${adminNote}` : ""}`,
    );
    setRejectDialog({ open: false, id: "", desc: "" });
    setAdminNote("");
    refresh();
    toast.success("Payment request rejected");
  };

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            data-ocid={`superadmin.payments.${f}.tab`}
            className="capitalize"
          >
            {f} <span className="ml-1 opacity-70 text-xs">({counts[f]})</span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="superadmin.payments.empty_state"
        >
          <CheckCircle2 className="h-10 w-10 opacity-30" />
          <p>No {filter === "all" ? "" : filter} payment requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, idx) => (
            <Card
              key={req.id}
              data-ocid={`superadmin.payments.item.${idx + 1}`}
              className="border-border bg-card shadow-none"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">
                        {req.description}
                      </p>
                      {req.status === "pending" && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 text-xs">
                          Awaiting Approval
                        </Badge>
                      )}
                      {req.status === "approved" && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 text-xs">
                          Approved
                        </Badge>
                      )}
                      {req.status === "rejected" && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20 text-xs">
                          Rejected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {fmtKES(req.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {req.reason}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {fmtTime(req.requestedAt)}
                    </p>
                    {req.adminNote && (
                      <p className="text-xs text-muted-foreground italic">
                        Admin note: {req.adminNote}
                      </p>
                    )}
                  </div>
                  {req.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                        onClick={() => handleApprove(req)}
                        data-ocid={`superadmin.payments.confirm_button.${idx + 1}`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() =>
                          setRejectDialog({
                            open: true,
                            id: req.id,
                            desc: req.description,
                          })
                        }
                        data-ocid={`superadmin.payments.delete_button.${idx + 1}`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(o) => {
          if (!o) {
            setRejectDialog({ open: false, id: "", desc: "" });
            setAdminNote("");
          }
        }}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="superadmin.payments.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Reject Payment Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Rejecting:{" "}
              <span className="font-medium text-foreground">
                {rejectDialog.desc}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="admin-note">Admin Note (optional)</Label>
              <Textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                data-ocid="superadmin.payments.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, id: "", desc: "" });
                setAdminNote("");
              }}
              data-ocid="superadmin.payments.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              data-ocid="superadmin.payments.submit_button"
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  logout: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "payment-approved": "bg-green-500/20 text-green-400 border-green-500/30",
  "payment-rejected": "bg-red-500/20 text-red-400 border-red-500/30",
  "session-terminated": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function AuditLogTab() {
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [clearConfirm, setClearConfirm] = useState(false);

  const refresh = useCallback(() => {
    setLog([...sessionStore.getAuditLog()].reverse());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClear = () => {
    sessionStore.clearAuditLog();
    setClearConfirm(false);
    refresh();
    toast.success("Audit log cleared");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{log.length} entries</p>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setClearConfirm(true)}
          data-ocid="superadmin.audit.delete_button"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Clear Log
        </Button>
      </div>

      {log.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="superadmin.audit.empty_state"
        >
          <AlertTriangle className="h-10 w-10 opacity-30" />
          <p>No audit entries yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[420px]">
          <div className="space-y-2 pr-4">
            {log.map((entry, idx) => (
              <div
                key={`${entry.timestamp}-${idx}`}
                data-ocid={`superadmin.audit.item.${idx + 1}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50"
              >
                <Badge
                  className={`shrink-0 text-[10px] uppercase tracking-wide font-semibold border ${
                    ACTION_COLORS[entry.action] ??
                    "bg-muted text-muted-foreground border-border"
                  } hover:opacity-100`}
                >
                  {entry.action}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{entry.detail}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {fmtTime(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <DialogContent className="max-w-sm" data-ocid="superadmin.audit.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Clear Audit Log?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all {log.length} audit entries. This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearConfirm(false)}
              data-ocid="superadmin.audit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              data-ocid="superadmin.audit.confirm_button"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SystemTab() {
  const [announcement, setAnnouncement] = useState(
    sessionStore.getAnnouncement(),
  );
  const [locked, setLocked] = useState(sessionStore.isPortalLocked());
  const sessions = sessionStore.getSessions();
  const requests = sessionStore.getPaymentRequests();

  const handlePostAnnouncement = () => {
    sessionStore.setAnnouncement(announcement);
    sessionStore.addAuditEntry(
      "announcement",
      `Posted: ${announcement.slice(0, 50)}`,
    );
    toast.success("Announcement posted");
  };

  const handleClearAnnouncement = () => {
    sessionStore.clearAnnouncement();
    setAnnouncement("");
    toast.success("Announcement cleared");
  };

  const toggleLock = () => {
    if (locked) {
      sessionStore.unlockPortal();
      sessionStore.addAuditEntry(
        "portal-unlocked",
        "Portal unlocked by super admin",
      );
      toast.success("Portal unlocked — new logins allowed");
    } else {
      sessionStore.lockPortal();
      sessionStore.addAuditEntry(
        "portal-locked",
        "Portal locked by super admin",
      );
      toast.warning("Portal locked — new logins blocked");
    }
    setLocked(!locked);
  };

  return (
    <div className="space-y-5">
      {/* Announcement */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display">
            Portal Announcement
          </CardTitle>
          <CardDescription className="text-xs">
            Post a notice that will appear as a banner on the Dashboard for all
            admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value.slice(0, 200))}
            placeholder="Write your announcement here..."
            rows={3}
            data-ocid="superadmin.system.textarea"
          />
          <p className="text-xs text-muted-foreground text-right">
            {announcement.length}/200
          </p>
          {announcement.trim() && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
              <span className="font-semibold">Preview: </span>
              {announcement}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handlePostAnnouncement}
              disabled={!announcement.trim()}
              data-ocid="superadmin.system.primary_button"
            >
              Post Announcement
            </Button>
            {sessionStore.getAnnouncement() && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAnnouncement}
                data-ocid="superadmin.system.secondary_button"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portal Lock */}
      <Card
        className={`border-2 shadow-none ${
          locked
            ? "border-red-500/40 bg-red-500/5"
            : "border-green-500/30 bg-green-500/5"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  locked ? "bg-red-500/20" : "bg-green-500/20"
                }`}
              >
                {locked ? (
                  <Lock className="h-6 w-6 text-red-400" />
                ) : (
                  <Unlock className="h-6 w-6 text-green-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Portal is{" "}
                  <span className={locked ? "text-red-400" : "text-green-400"}>
                    {locked ? "LOCKED" : "OPEN"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {locked
                    ? "New logins are blocked for all users"
                    : "New logins are allowed"}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleLock}
              variant={locked ? "outline" : "destructive"}
              className={
                locked
                  ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  : ""
              }
              data-ocid="superadmin.system.toggle"
            >
              {locked ? "Unlock Portal" : "Lock Portal"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Sessions", value: sessions.length },
              { label: "Payment Requests", value: requests.length },
              {
                label: "Approved",
                value: requests.filter((r) => r.status === "approved").length,
              },
              {
                label: "Rejected",
                value: requests.filter((r) => r.status === "rejected").length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-lg bg-muted/40 text-center space-y-1"
              >
                <p className="text-2xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuperAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(sessionStore.isPortalLocked());

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (password === SUPER_ADMIN_PASSWORD) {
      sessionStore.addAuditEntry(
        "super-admin-login",
        "Super admin mode activated",
      );
      setAuthenticated(true);
    } else {
      setError("Incorrect super admin password.");
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl shadow-card p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto">
                <ShieldAlert className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Super Admin Mode
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the super admin password to continue
                </p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sa-password">Super Admin Password</Label>
                <div className="relative">
                  <Input
                    id="sa-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoFocus
                    className="pr-10"
                    data-ocid="superadmin.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw ? (
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
                  data-ocid="superadmin.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11"
                data-ocid="superadmin.primary_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Verifying...
                  </>
                ) : (
                  "Enter Super Admin Mode"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                Super Admin Control Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                Full administrative control — handle with care
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newLocked = !locked;
                if (newLocked) {
                  sessionStore.lockPortal();
                  sessionStore.addAuditEntry(
                    "portal-locked",
                    "Portal locked from header",
                  );
                  toast.warning("Portal locked");
                } else {
                  sessionStore.unlockPortal();
                  sessionStore.addAuditEntry(
                    "portal-unlocked",
                    "Portal unlocked from header",
                  );
                  toast.success("Portal unlocked");
                }
                setLocked(newLocked);
              }}
              className={
                locked
                  ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                  : "border-green-500/30 text-green-400 hover:bg-green-500/10"
              }
              data-ocid="superadmin.system.toggle"
            >
              {locked ? (
                <>
                  <Lock className="h-3.5 w-3.5 mr-1.5" /> Portal Locked
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5 mr-1.5" /> Portal Open
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                sessionStore.addAuditEntry(
                  "super-admin-logout",
                  "Exited super admin mode",
                );
                setAuthenticated(false);
                setPassword("");
              }}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="superadmin.secondary_button"
            >
              Exit Super Admin Mode
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sessions">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="sessions" data-ocid="superadmin.sessions.tab">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="payments" data-ocid="superadmin.payments.tab">
              Payment Approvals
            </TabsTrigger>
            <TabsTrigger value="audit" data-ocid="superadmin.audit.tab">
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="system" data-ocid="superadmin.system.tab">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-5">
            <SessionsTab />
          </TabsContent>
          <TabsContent value="payments" className="mt-5">
            <PaymentApprovalsTab />
          </TabsContent>
          <TabsContent value="audit" className="mt-5">
            <AuditLogTab />
          </TabsContent>
          <TabsContent value="system" className="mt-5">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
