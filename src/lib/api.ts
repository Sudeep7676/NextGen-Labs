// API client for the NextGen Labs contact backend (Spring Boot).
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8080";

export const TURNSTILE_SITE_KEY = import.meta.env
  .VITE_TURNSTILE_SITE_KEY as string | undefined;

export const INQUIRY_TYPES = [
  { value: "BOOK_DEMO", label: "Book Demo" },
  { value: "PRODUCT_INQUIRY", label: "Product Inquiry" },
  { value: "PARTNERSHIP_INQUIRY", label: "Partnership Inquiry" },
  { value: "CAREER_OPPORTUNITY", label: "Career Opportunity" },
  { value: "TECHNICAL_SUPPORT", label: "Technical Support" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
] as const;

export const STATUSES = [
  "NEW",
  "IN_REVIEW",
  "RESPONDED",
  "FOLLOW_UP",
  "CLOSED",
] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "demo",
    label: "Demo Response",
    subject: "Your NextGen Labs Demo",
    body:
      "Hello {{name}},\n\nThank you for your interest in a demo of our platform. We'd love to walk you through it.\n\nPlease share a few time slots that work for you this week, and we'll send a calendar invite with the meeting link.\n\nRegards,\nNextGen Labs Team",
  },
  {
    id: "partnership",
    label: "Partnership Response",
    subject: "Partnering with NextGen Labs",
    body:
      "Hello {{name}},\n\nThank you for reaching out about a partnership. We're excited about the possibility of working together.\n\nCould you share a bit more about your goals and the scope you have in mind? We'll then set up a call with the right team.\n\nRegards,\nNextGen Labs Team",
  },
  {
    id: "product",
    label: "Product Response",
    subject: "About our products",
    body:
      "Hello {{name}},\n\nThanks for your interest in our products. We'd be happy to answer your questions and help you find the right fit.\n\nLet us know a little more about your use case and we'll follow up with details.\n\nRegards,\nNextGen Labs Team",
  },
  {
    id: "career",
    label: "Career Response",
    subject: "Your interest in joining NextGen Labs",
    body:
      "Hello {{name}},\n\nThank you for your interest in building the future with us. We've received your details.\n\nOur team will review your background and reach out if there's a strong match with current or upcoming roles.\n\nRegards,\nNextGen Labs Team",
  },
  {
    id: "support",
    label: "Support Response",
    subject: "Re: Your support request",
    body:
      "Hello {{name}},\n\nThank you for contacting support. We're looking into your request.\n\nTo help us resolve this quickly, please share any relevant details (screenshots, steps to reproduce, account/email).\n\nRegards,\nNextGen Labs Support",
  },
];

export interface ContactPayload {
  fullName: string;
  email: string;
  companyName?: string;
  phoneNumber?: string;
  inquiryType: string;
  message: string;
  turnstileToken?: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  companyName: string | null;
  phoneNumber: string | null;
  inquiryType: string;
  inquiryTypeLabel: string;
  message: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailMessage {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sender: string;
  status: string;
  kind: string;
  createdAt: string;
}

export interface ContactDetail {
  inquiry: ContactInquiry;
  emails: EmailMessage[];
}

export interface DashboardStats {
  total: number;
  fresh: number;
  inReview: number;
  responded: number;
  followUp: number;
  closed: number;
  responseRate: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  refreshToken: string;
  email: string;
  fullName: string;
  role: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lastLoginDevice: string | null;
}

export interface LoginStepResponse {
  mfaRequired: boolean;
  mfaEnrolled: boolean;
  challengeToken: string;
  message: string;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
  backupCodes: string[];
}

export interface MfaEnableResponse {
  auth: AuthResponse;
  backupCodes: string[];
}

export interface SecurityDashboard {
  overview: {
    failedLogins24h: number;
    lockedAccounts: number;
    mfaEnabledAccounts: number;
    totalAdmins: number;
    loginSuccess24h: number;
  };
  lockedAccounts: {
    id: string;
    email: string;
    role: string;
    failedAttempts: number;
    manualUnlockRequired: boolean;
    lockedUntil: string | null;
  }[];
  recentEvents: {
    id: string;
    action: string;
    actor: string;
    ipAddress: string | null;
    device: string | null;
    result: string | null;
    details: string | null;
    createdAt: string;
  }[];
  mfaStatuses: {
    id: string;
    email: string;
    role: string;
    mfaEnabled: boolean;
    lastLoginAt: string | null;
    lastLoginIp: string | null;
  }[];
}

/** HTTP status thrown so the UI can distinguish 401 / 403 / 423. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) {
        message =
          typeof body.message === "string"
            ? body.message
            : Object.values(body.message).join(", ");
      }
    } catch {
      /* ignore parse error */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/* ------------------------------- Public -------------------------------- */

export async function submitContact(payload: ContactPayload) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ success: boolean; message: string; id: string }>(res);
}

/* -------------------------------- Auth --------------------------------- */

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle<LoginStepResponse>(res);
}

export async function mfaSetup(challengeToken: string) {
  const res = await fetch(`${API_BASE}/api/auth/mfa/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken }),
  });
  return handle<MfaSetupResponse>(res);
}

export async function mfaEnable(challengeToken: string, secret: string, code: string) {
  const res = await fetch(`${API_BASE}/api/auth/mfa/enable`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, secret, code }),
  });
  return handle<MfaEnableResponse>(res);
}

export async function mfaVerify(challengeToken: string, code: string) {
  const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, code }),
  });
  return handle<AuthResponse>(res);
}

export async function refreshSession(refreshToken: string) {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return handle<AuthResponse>(res);
}

export async function logout(refreshToken: string) {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}

export async function fetchSecurityDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/security/dashboard`, {
    headers: authHeaders(token),
  });
  return handle<SecurityDashboard>(res);
}

export async function unlockAccount(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/security/accounts/${id}/unlock`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle<void>(res);
}

/* -------------------------------- Admin -------------------------------- */

export interface ListParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export async function fetchStats(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/contact-inquiries/stats`, {
    headers: authHeaders(token),
  });
  return handle<DashboardStats>(res);
}

export async function fetchInquiries(token: string, params: ListParams) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.type) q.set("type", params.type);
  q.set("page", String(params.page ?? 0));
  q.set("size", String(params.size ?? 10));
  q.set("sortBy", params.sortBy ?? "createdAt");
  q.set("direction", params.direction ?? "desc");
  const res = await fetch(
    `${API_BASE}/api/admin/contact-inquiries?${q.toString()}`,
    { headers: authHeaders(token) }
  );
  return handle<PageResponse<ContactInquiry>>(res);
}

export async function fetchInquiry(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/contact-inquiries/${id}`, {
    headers: authHeaders(token),
  });
  return handle<ContactDetail>(res);
}

export async function updateInquiryStatus(
  token: string,
  id: string,
  body: { status: string; priority?: string; assignedTo?: string }
) {
  const res = await fetch(
    `${API_BASE}/api/admin/contact-inquiries/${id}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }
  );
  return handle<ContactInquiry>(res);
}

export async function assignInquiry(
  token: string,
  id: string,
  body: { assignedTo: string; priority?: string }
) {
  const res = await fetch(
    `${API_BASE}/api/admin/contact-inquiries/${id}/assign`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }
  );
  return handle<ContactInquiry>(res);
}

export async function updateNotes(token: string, id: string, notes: string) {
  const res = await fetch(
    `${API_BASE}/api/admin/contact-inquiries/${id}/notes`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ notes }),
    }
  );
  return handle<ContactInquiry>(res);
}

export async function replyToInquiry(
  token: string,
  id: string,
  body: { to: string; subject: string; message: string }
) {
  const res = await fetch(
    `${API_BASE}/api/admin/contact-inquiries/${id}/reply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }
  );
  return handle<EmailMessage>(res);
}

export async function deleteInquiry(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/contact-inquiries/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handle<void>(res);
}
