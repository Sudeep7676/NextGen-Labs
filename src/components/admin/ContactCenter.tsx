import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  LogOut,
  Search,
  Download,
  Trash2,
  X,
  Inbox,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Mail,
  Send,
  Save,
  Check,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  Copy,
} from "lucide-react";
import {
  login as apiLogin,
  mfaSetup,
  mfaEnable,
  mfaVerify,
  logout as apiLogout,
  fetchStats,
  fetchInquiries,
  fetchInquiry,
  updateInquiryStatus,
  assignInquiry,
  updateNotes,
  replyToInquiry,
  deleteInquiry,
  fetchSecurityDashboard,
  unlockAccount,
  ApiError,
  INQUIRY_TYPES,
  STATUSES,
  PRIORITIES,
  EMAIL_TEMPLATES,
  type AuthResponse,
  type ContactInquiry,
  type ContactDetail,
  type EmailMessage,
  type DashboardStats,
  type SecurityDashboard,
} from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const statusStyles: Record<string, string> = {
  NEW: "bg-sky-500/15 text-sky-500",
  IN_REVIEW: "bg-amber-500/15 text-amber-500",
  RESPONDED: "bg-violet-500/15 text-violet-500",
  FOLLOW_UP: "bg-cyan-500/15 text-cyan-500",
  CLOSED: "bg-slate-500/15 text-slate-400",
};

const priorityStyles: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-sky-500",
  HIGH: "text-amber-500",
  URGENT: "text-red-500",
};

const label = (s: string) => s.replace(/_/g, " ");

export function ContactCenter() {
  const { token, role, fullName, setAuth, logout } = useAuth();
  if (!token) return <LoginView onAuth={setAuth} />;
  return <Dashboard token={token} role={role} fullName={fullName} onLogout={logout} />;
}

const inputCls =
  "w-full rounded-xl border border-current/10 bg-transparent px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20";

/* ------------------------- Multi-step MFA login ----------------------- */

type Step = "password" | "verify" | "setup" | "backup";

function LoginView({ onAuth }: { onAuth: (a: AuthResponse) => void }) {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [pendingAuth, setPendingAuth] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fail = (err: unknown) => {
    if (err instanceof ApiError && err.status === 423)
      setError("Account locked. Contact a SUPER_ADMIN or try later.");
    else if (err instanceof Error) setError(err.message);
    else setError("Something went wrong");
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiLogin(email, password);
      setChallenge(res.challengeToken);
      if (res.mfaEnrolled) {
        setStep("verify");
      } else {
        const setup = await mfaSetup(res.challengeToken);
        setSecret(setup.secret);
        setOtpauth(setup.otpauthUri);
        setStep("setup");
      }
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const submitVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      onAuth(await mfaVerify(challenge, code.trim()));
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const submitEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await mfaEnable(challenge, secret, code.trim());
      setPendingAuth(res.auth);
      setBackupCodes(res.backupCodes);
      setStep("backup");
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = otpauth
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauth)}`
    : "";

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm rounded-3xl glass-strong p-8 shadow-glass-lg">
        <div className="mb-1 flex items-center gap-2 type-eyebrow text-accent-400">
          <ShieldCheck size={14} /> Admin · Secure Sign-in
        </div>

        {step === "password" && (
          <form onSubmit={submitPassword}>
            <h1 className="type-h3 mt-2">Sign in</h1>
            <p className="mt-2 text-[13.5px] text-muted">Multi-factor authentication required.</p>
            <div className="mt-6 flex flex-col gap-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nextgenlabs.ai" className={inputCls} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} />
              {error && <ErrorLine msg={error} />}
              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? <Loader2 size={17} className="animate-spin" /> : "Continue"}
              </Button>
              <a href="#" className="mt-1 text-center text-[13px] text-muted hover:text-current">← Back to site</a>
            </div>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={submitVerify}>
            <h1 className="type-h3 mt-2">Verify it's you</h1>
            <p className="mt-2 text-[13.5px] text-muted">Enter the 6-digit code from your authenticator app (or a backup code).</p>
            <div className="mt-6 flex flex-col gap-3">
              <input autoFocus inputMode="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className={cn(inputCls, "text-center tracking-[0.3em]")} />
              {error && <ErrorLine msg={error} />}
              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? <Loader2 size={17} className="animate-spin" /> : "Verify & sign in"}
              </Button>
            </div>
          </form>
        )}

        {step === "setup" && (
          <form onSubmit={submitEnable}>
            <h1 className="type-h3 mt-2">Set up MFA</h1>
            <p className="mt-2 text-[13.5px] text-muted">Scan this QR in Google Authenticator / Authy, then enter the code.</p>
            <div className="mt-5 flex flex-col items-center gap-3">
              {qrUrl && <img src={qrUrl} alt="MFA QR" className="h-[180px] w-[180px] rounded-xl bg-white p-2" />}
              <div className="w-full rounded-lg glass p-3 text-center">
                <div className="type-eyebrow text-muted">Manual key</div>
                <code className="mt-1 block break-all text-[12px] text-current/80">{secret}</code>
              </div>
              <input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className={cn(inputCls, "text-center tracking-[0.3em]")} />
              {error && <ErrorLine msg={error} />}
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                {loading ? <Loader2 size={17} className="animate-spin" /> : "Enable MFA & sign in"}
              </Button>
            </div>
          </form>
        )}

        {step === "backup" && (
          <div>
            <h1 className="type-h3 mt-2">Save your backup codes</h1>
            <p className="mt-2 text-[13.5px] text-muted">Store these somewhere safe. Each can be used once if you lose your device.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl glass p-4 font-mono text-[13px]">
              {backupCodes.map((b) => <span key={b}>{b}</span>)}
            </div>
            <Button
              size="sm"
              variant="glass"
              className="mt-3"
              onClick={() => navigator.clipboard?.writeText(backupCodes.join("\n"))}
            >
              <Copy size={14} /> Copy codes
            </Button>
            <Button size="lg" className="mt-4 w-full" onClick={() => pendingAuth && onAuth(pendingAuth)}>
              I've saved them — continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
      <AlertCircle size={14} /> {msg}
    </p>
  );
}

/* ----------------------------- Dashboard ------------------------------ */

function Dashboard({
  token,
  role,
  fullName,
  onLogout,
}: {
  token: string;
  role: string | null;
  fullName: string | null;
  onLogout: () => void;
}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rows, setRows] = useState<ContactInquiry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [showSecurity, setShowSecurity] = useState(false);

  const { refreshToken, lastLoginAt, lastLoginIp, lastLoginDevice } = useAuth();
  const canDelete = role === "SUPER_ADMIN";

  const signOut = useCallback(async () => {
    if (refreshToken) await apiLogout(refreshToken);
    onLogout();
  }, [refreshToken, onLogout]);

  // Auto-logout after 15 minutes of inactivity.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void signOut(), 15 * 60 * 1000);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [signOut]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, list] = await Promise.all([
        fetchStats(token),
        fetchInquiries(token, {
          search,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          page,
          size: PAGE_SIZE,
          direction,
        }),
      ]);
      setStats(s);
      setRows(list.content);
      setTotalPages(list.totalPages);
      setTotalElements(list.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      if (err instanceof Error && err.message.includes("401")) onLogout();
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, typeFilter, page, direction, onLogout]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openDetail = async (id: string) => {
    try {
      setDetail(await fetchInquiry(token, id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open inquiry");
    }
  };

  const refreshDetail = async () => {
    if (detail) setDetail(await fetchInquiry(token, detail.inquiry.id));
    await load();
  };

  const changeStatus = async (row: ContactInquiry, status: string) => {
    try {
      await updateInquiryStatus(token, row.id, { status });
      await load();
      if (detail?.inquiry.id === row.id) await refreshDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const remove = async (row: ContactInquiry) => {
    if (!confirm(`Delete inquiry from ${row.fullName}? This cannot be undone.`)) return;
    try {
      await deleteInquiry(token, row.id);
      if (detail?.inquiry.id === row.id) setDetail(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Type", "Status", "Priority", "Created", "Message"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.fullName, r.email, r.companyName ?? "", r.inquiryTypeLabel, r.status, r.priority, new Date(r.createdAt).toLocaleString(), r.message]
          .map(esc)
          .join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact-inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = stats
    ? [
        { label: "Total Inquiries", value: stats.total },
        { label: "New", value: stats.fresh },
        { label: "In Review", value: stats.inReview },
        { label: "Responded", value: stats.responded },
        { label: "Closed", value: stats.closed },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="type-eyebrow text-accent-400">Admin · Contact Center</div>
            <h1 className="type-h3 mt-2">Inquiries</h1>
            <p className="mt-1 text-[13px] text-muted">Signed in as {fullName} · {role}</p>
            {(lastLoginAt || lastLoginIp) && (
              <p className="mt-0.5 text-[12px] text-muted/80">
                Last login: {lastLoginAt ? new Date(lastLoginAt).toLocaleString() : "—"}
                {lastLoginIp ? ` · ${lastLoginIp}` : ""}
                {lastLoginDevice ? ` · ${lastLoginDevice}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={() => setShowSecurity(true)}><ShieldCheck size={15} /> Security</Button>
            <Button variant="glass" size="sm" onClick={load}><RefreshCw size={15} /> Refresh</Button>
            <Button variant="glass" size="sm" onClick={exportCSV} disabled={!rows.length}><Download size={15} /> CSV</Button>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut size={15} /> Sign out</Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl glass p-5">
              <div className="font-display text-[26px] font-bold tracking-tight text-gradient">{c.value}</div>
              <div className="mt-1 text-[12.5px] text-muted">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value); }}
              placeholder="Search name, email, company…"
              className="w-full rounded-xl border border-current/10 bg-transparent py-2.5 pl-9 pr-4 text-[14px] outline-none focus:border-accent-500/50"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} className="rounded-xl border border-current/10 bg-transparent px-3 py-2.5 text-[14px] outline-none focus:border-accent-500/50">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => { setPage(0); setTypeFilter(e.target.value); }} className="rounded-xl border border-current/10 bg-transparent px-3 py-2.5 text-[14px] outline-none focus:border-accent-500/50">
            <option value="">All types</option>
            {INQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={() => setDirection((d) => (d === "desc" ? "asc" : "desc"))} className="rounded-xl border border-current/10 px-3 py-2.5 text-[13px] text-muted hover:text-current">
            Date {direction === "desc" ? "↓" : "↑"}
          </button>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-[13.5px] text-red-500">
            <AlertCircle size={15} /> {error}
          </p>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-current/10 text-[12px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-muted"><Loader2 size={20} className="mx-auto animate-spin" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-muted"><Inbox size={24} className="mx-auto mb-2" />No inquiries found.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-current/5 transition-colors hover:bg-current/[0.03]">
                      <td className="px-5 py-3">
                        <button onClick={() => openDetail(r.id)} className="text-left font-medium hover:text-accent-500">{r.fullName}</button>
                        <div className="text-[12px] text-muted">{r.email}</div>
                      </td>
                      <td className="px-5 py-3 text-muted">{r.companyName || "—"}</td>
                      <td className="px-5 py-3 text-muted">{r.inquiryTypeLabel}</td>
                      <td className={cn("px-5 py-3 font-medium", priorityStyles[r.priority])}>{r.priority}</td>
                      <td className="px-5 py-3">
                        <select value={r.status} onChange={(e) => changeStatus(r, e.target.value)} className={cn("rounded-full px-2.5 py-1 text-[12px] font-medium outline-none", statusStyles[r.status])}>
                          {STATUSES.map((s) => <option key={s} value={s} className="bg-[var(--bg)] text-current">{label(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(r.id)} className="rounded-lg px-2.5 py-1 text-[13px] text-accent-500 hover:bg-accent-500/10">View</button>
                          {canDelete && (
                            <button onClick={() => remove(r)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-current/10 px-5 py-3 text-[13px] text-muted">
            <span>{totalElements} total</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="grid h-8 w-8 place-items-center rounded-lg disabled:opacity-40 enabled:hover:bg-current/5"><ChevronLeft size={16} /></button>
              <span>{page + 1} / {Math.max(totalPages, 1)}</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className="grid h-8 w-8 place-items-center rounded-lg disabled:opacity-40 enabled:hover:bg-current/5"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <InquiryDrawer
          token={token}
          detail={detail}
          onClose={() => setDetail(null)}
          onChanged={refreshDetail}
        />
      )}

      {showSecurity && (
        <SecurityPanel token={token} canUnlock={canDelete} onClose={() => setShowSecurity(false)} />
      )}
    </div>
  );
}

/* --------------------------- Security panel --------------------------- */

function SecurityPanel({
  token,
  canUnlock,
  onClose,
}: {
  token: string;
  canUnlock: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<SecurityDashboard | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await fetchSecurityDashboard(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const unlock = async (id: string) => {
    try {
      await unlockAccount(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    }
  };

  const cards = data
    ? [
        { label: "Failed logins (24h)", value: data.overview.failedLogins24h },
        { label: "Locked accounts", value: data.overview.lockedAccounts },
        { label: "MFA enabled", value: `${data.overview.mfaEnabledAccounts}/${data.overview.totalAdmins}` },
        { label: "Logins (24h)", value: data.overview.loginSuccess24h },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[var(--bg)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 type-eyebrow text-accent-400">
            <ShieldCheck size={15} /> Security Dashboard
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={15} /> Close</Button>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-[13.5px] text-red-500">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl glass p-5">
              <div className="font-display text-[24px] font-bold tracking-tight text-gradient">{c.value}</div>
              <div className="mt-1 text-[12.5px] text-muted">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Locked accounts */}
        <h3 className="mt-8 flex items-center gap-2 font-display text-[16px] font-semibold"><Lock size={15} /> Locked Accounts</h3>
        <div className="mt-3 overflow-hidden rounded-2xl glass">
          {data && data.lockedAccounts.length === 0 ? (
            <p className="px-5 py-6 text-center text-[13px] text-muted">No locked accounts.</p>
          ) : (
            <table className="w-full text-left text-[13.5px]">
              <thead><tr className="border-b border-current/10 text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-2.5">Email</th><th className="px-5 py-2.5">Role</th><th className="px-5 py-2.5">Fails</th><th className="px-5 py-2.5">Type</th><th className="px-5 py-2.5 text-right">Action</th>
              </tr></thead>
              <tbody>
                {data?.lockedAccounts.map((a) => (
                  <tr key={a.id} className="border-b border-current/5">
                    <td className="px-5 py-2.5">{a.email}</td>
                    <td className="px-5 py-2.5 text-muted">{a.role}</td>
                    <td className="px-5 py-2.5 text-amber-500">{a.failedAttempts}</td>
                    <td className="px-5 py-2.5 text-muted">{a.manualUnlockRequired ? "Manual" : "Timed"}</td>
                    <td className="px-5 py-2.5 text-right">
                      {canUnlock && (
                        <button onClick={() => unlock(a.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12.5px] text-accent-500 hover:bg-accent-500/10"><Unlock size={13} /> Unlock</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MFA status */}
        <h3 className="mt-8 flex items-center gap-2 font-display text-[16px] font-semibold"><KeyRound size={15} /> MFA Status</h3>
        <div className="mt-3 flex flex-col gap-2">
          {data?.mfaStatuses.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl glass px-4 py-2.5 text-[13.5px]">
              <span>{m.email} <span className="text-muted">· {m.role}</span></span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", m.mfaEnabled ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500")}>
                {m.mfaEnabled ? "MFA ON" : "MFA OFF"}
              </span>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <h3 className="mt-8 font-display text-[16px] font-semibold">Recent Security Events</h3>
        <div className="mt-3 overflow-hidden rounded-2xl glass">
          <table className="w-full text-left text-[13px]">
            <thead><tr className="border-b border-current/10 text-[11px] uppercase tracking-wider text-muted">
              <th className="px-5 py-2.5">Action</th><th className="px-5 py-2.5">Actor</th><th className="px-5 py-2.5">IP</th><th className="px-5 py-2.5">Result</th><th className="px-5 py-2.5">When</th>
            </tr></thead>
            <tbody>
              {data?.recentEvents.map((e) => (
                <tr key={e.id} className="border-b border-current/5">
                  <td className="px-5 py-2 font-mono text-[11.5px]">{e.action}</td>
                  <td className="px-5 py-2 text-muted">{e.actor}</td>
                  <td className="px-5 py-2 text-muted">{e.ipAddress || "—"}</td>
                  <td className={cn("px-5 py-2", e.result === "SUCCESS" ? "text-emerald-500" : e.result === "FAILED" || e.result === "LOCKED" || e.result === "BLOCKED" ? "text-red-500" : "text-muted")}>{e.result || "—"}</td>
                  <td className="px-5 py-2 text-muted">{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Detail drawer ---------------------------- */

function InquiryDrawer({
  token,
  detail,
  onClose,
  onChanged,
}: {
  token: string;
  detail: ContactDetail;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const c = detail.inquiry;
  const [notes, setNotes] = useState(c.notes ?? "");
  const [assignee, setAssignee] = useState(c.assignedTo ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateNotes(token, c.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
      await onChanged();
    } finally {
      setSavingNotes(false);
    }
  };

  const setPriority = async (priority: string) => {
    setBusy(true);
    try {
      await assignInquiry(token, c.id, { assignedTo: assignee, priority });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const saveAssignee = async () => {
    setBusy(true);
    try {
      await assignInquiry(token, c.id, { assignedTo: assignee });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status: string) => {
    setBusy(true);
    try {
      await updateInquiryStatus(token, c.id, { status });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-[var(--bg)] p-7 shadow-glass-lg sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-medium", statusStyles[c.status])}>{label(c.status)}</span>
            <h2 className="type-h3 mt-3">{c.fullName}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-current/5"><X size={18} /></button>
        </div>

        {/* inquiry details */}
        <dl className="mt-6 flex flex-col gap-3 text-[14px]">
          <Row k="Email"><a href={`mailto:${c.email}`} className="text-accent-500 hover:underline">{c.email}</a></Row>
          <Row k="Company">{c.companyName || "—"}</Row>
          <Row k="Phone">{c.phoneNumber || "—"}</Row>
          <Row k="Inquiry Type">{c.inquiryTypeLabel}</Row>
          <Row k="Created">{new Date(c.createdAt).toLocaleString()}</Row>
        </dl>
        <div className="mt-4">
          <div className="type-eyebrow text-muted">Message</div>
          <p className="mt-2 whitespace-pre-wrap rounded-xl glass p-4 text-[14px] text-current/80">{c.message}</p>
        </div>

        {/* workflow */}
        <div className="mt-6">
          <div className="type-eyebrow mb-2 text-muted">Status</div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} disabled={busy} onClick={() => setStatus(s)} className={cn("rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors", c.status === s ? "bg-accent-gradient text-white" : "glass text-current/70 hover:text-current")}>{label(s)}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="type-eyebrow mb-2 text-muted">Priority</div>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button key={p} disabled={busy} onClick={() => setPriority(p)} className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors", c.priority === p ? "bg-accent-gradient text-white" : "glass text-current/70 hover:text-current")}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="type-eyebrow mb-2 text-muted">Assigned to</div>
            <div className="flex gap-2">
              <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="admin@…" className="w-full rounded-lg border border-current/10 bg-transparent px-3 py-1.5 text-[13px] outline-none focus:border-accent-500/50" />
              <button onClick={saveAssignee} disabled={busy} className="rounded-lg glass px-3 text-[13px] hover:text-accent-500"><Save size={14} /></button>
            </div>
          </div>
        </div>

        {/* internal notes */}
        <div className="mt-6">
          <div className="type-eyebrow mb-2 text-muted">Internal Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Private notes for the team…" className="w-full resize-none rounded-xl border border-current/10 bg-transparent p-3 text-[14px] outline-none focus:border-accent-500/50" />
          <Button size="sm" variant="glass" onClick={saveNotes} disabled={savingNotes} className="mt-2">
            {savingNotes ? <Loader2 size={14} className="animate-spin" /> : notesSaved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save notes</>}
          </Button>
        </div>

        {/* reply */}
        <div className="mt-6">
          <Button onClick={() => setReplyOpen(true)} className="w-full"><Mail size={16} /> Reply to {c.fullName.split(" ")[0]}</Button>
        </div>

        {/* communication history */}
        <div className="mt-7">
          <div className="type-eyebrow mb-3 text-muted">Communication History</div>
          {detail.emails.length === 0 ? (
            <p className="rounded-xl glass px-4 py-6 text-center text-[13px] text-muted">No emails sent yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {detail.emails.map((m) => <EmailRow key={m.id} m={m} />)}
            </div>
          )}
        </div>
      </div>

      {replyOpen && (
        <ReplyComposer
          token={token}
          inquiry={c}
          onClose={() => setReplyOpen(false)}
          onSent={async () => { setReplyOpen(false); await onChanged(); }}
        />
      )}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-current/5 pb-2.5">
      <dt className="text-[12px] uppercase tracking-wider text-muted">{k}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function EmailRow({ m }: { m: EmailMessage }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl glass p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium">{m.subject}</span>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", m.status === "SENT" ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500")}>{m.status}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-muted">to {m.recipient} · {m.kind.replace(/_/g, " ").toLowerCase()} · {new Date(m.createdAt).toLocaleString()}</div>
        </div>
      </button>
      {open && (
        <div className="mt-3 border-t border-current/10 pt-3 text-[13px] text-current/75" dangerouslySetInnerHTML={{ __html: m.body }} />
      )}
    </div>
  );
}

/* --------------------------- Reply composer --------------------------- */

function ReplyComposer({
  token,
  inquiry,
  onClose,
  onSent,
}: {
  token: string;
  inquiry: ContactInquiry;
  onClose: () => void;
  onSent: () => Promise<void> | void;
}) {
  const firstName = inquiry.fullName.split(" ")[0];
  const [to] = useState(inquiry.email);
  const [subject, setSubject] = useState(`Re: ${inquiry.inquiryTypeLabel}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const applyTemplate = (id: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSubject(tpl.subject);
    setMessage(tpl.body.replace(/\{\{name\}\}/g, firstName));
  };

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const res = await replyToInquiry(token, inquiry.id, { to, subject, message });
      if (res.status !== "SENT") throw new Error("Email could not be delivered");
      setSent(true);
      setTimeout(() => onSent(), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-current/10 bg-transparent px-4 py-2.5 text-[14px] outline-none focus:border-accent-500/50";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl glass-strong p-7 shadow-glass-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="type-h3">Compose reply</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-current/5"><X size={18} /></button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {EMAIL_TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => applyTemplate(t.id)} className="rounded-full glass px-3 py-1.5 text-[12.5px] text-current/70 hover:text-accent-500">{t.label}</button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-[12px] uppercase tracking-wider text-muted">To</label>
            <input value={to} readOnly className={cn(inputCls, "opacity-70")} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] uppercase tracking-wider text-muted">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] uppercase tracking-wider text-muted">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Write your response…" className={cn(inputCls, "resize-none")} />
          </div>
          {error && <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-500"><AlertCircle size={14} /> {error}</p>}
          <Button onClick={send} size="lg" disabled={sending || sent || !message.trim()} className="w-full">
            {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : sent ? <><Check size={16} /> Sent</> : <><Send size={16} /> Send reply</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
