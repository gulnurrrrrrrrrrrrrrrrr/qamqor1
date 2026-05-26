import type { Event } from "@/lib/types";
import type { SessionUser } from "@/lib/auth/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const api = {
  me: () => request<{ user: SessionUser | null }>("/api/auth/me"),
  register: (body: { email: string; password: string; name: string; role: string }) =>
    request<{ user: SessionUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (email: string, password: string) =>
    request<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  events: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ events: Event[] }>(`/api/events${q ? `?${q}` : ""}`);
  },
  createEvent: (body: Record<string, unknown>) =>
    request<{ event: Event }>("/api/events", { method: "POST", body: JSON.stringify(body) }),
  updateEvent: (id: string, body: Record<string, unknown>) =>
    request<{ event: Event }>(`/api/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteEvent: (id: string) => request<{ ok: boolean }>(`/api/events/${id}`, { method: "DELETE" }),

  apply: (eventId: string) =>
    request<{ application: unknown }>("/api/applications", { method: "POST", body: JSON.stringify({ eventId }) }),

  applications: () => request<{ applications: { id: string; event: string; org: string; date: string; status: string; eventId: string }[] }>("/api/applications"),
  updateApplication: (id: string, status: string) =>
    request<{ application: unknown }>(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }) }),

  volunteerDashboard: () =>
    request<{
      stats: { trustScore: number; leadershipIndex: number; impactHours: number; admissionsReadiness: number };
      timeline: { id: string; title: string; org: string; date: string; hours: number; verified: boolean }[];
      skills: { name: string; value: number }[];
      certificates: { id: string; name: string; issuer: string; date: string }[];
    }>("/api/volunteer/dashboard"),

  profile: () => request<{ name: string; email: string; skills: { name: string; value: number }[] }>("/api/volunteer/profile"),
  updateProfile: (body: { name?: string; skills?: { name: string; value: number }[] }) =>
    request<{ ok: boolean }>("/api/volunteer/profile", { method: "PATCH", body: JSON.stringify(body) }),

  notifications: () => request<{ notifications: { id: string; title: string; body: string; time: string }[] }>("/api/notifications"),

  bookmarks: () => request<{ events: Event[] }>("/api/bookmarks"),
  addBookmark: (eventId: string) => request<{ ok: boolean }>("/api/bookmarks", { method: "POST", body: JSON.stringify({ eventId }) }),
  removeBookmark: (eventId: string) => request<{ ok: boolean }>(`/api/bookmarks/${eventId}`, { method: "DELETE" }),

  orgAnalytics: () =>
    request<{
      totalEvents: number;
      activeVolunteers: number;
      verifiedHours: number;
      avgTrust: number;
      fraudAlerts: number;
      eventPerformance: { name: string; fill: number; hours: number }[];
      org: { name: string; logo: string; description: string | null; verified: boolean };
    }>("/api/organization/analytics"),

  orgProfile: () => request<{ organization: { id: string; name: string; logo: string; description: string | null; verified: boolean } }>("/api/organization/profile"),
  updateOrgProfile: (body: { name?: string; description?: string; logo?: string }) =>
    request<{ organization: unknown }>("/api/organization/profile", { method: "PATCH", body: JSON.stringify(body) }),

  orgApplications: () =>
    request<{ applications: { id: string; name: string; role: string; trust: number; status: string }[] }>("/api/applications"),

  generateQr: (eventId?: string) =>
    request<{ eventId: string; eventTitle: string; qrToken: string; checkInUrl: string }>("/api/attendance/qr", {
      method: "POST",
      body: JSON.stringify(eventId ? { eventId } : {}),
    }),
  configureGeo: (body: { eventId: string; latitude: number; longitude: number; radiusMeters?: number }) =>
    request<{ eventId: string; eventTitle: string; latitude: number; longitude: number; radiusMeters: number }>("/api/attendance/geo", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  attendanceReview: () =>
    request<{ pending: { id: string; volunteer: string; event: string; status: string; trust: number }[]; count: number }>("/api/attendance/review"),

  checkInQr: (qrToken: string) =>
    request<{ eventTitle: string; org: string; method: string; checkedInAt: string }>("/api/attendance/check-in/qr", {
      method: "POST",
      body: JSON.stringify({ qrToken }),
    }),
  checkInGeo: (eventId: string, latitude: number, longitude: number) =>
    request<{ eventTitle: string; org: string; method: string; distanceMeters?: number; checkedInAt: string }>("/api/attendance/check-in/geo", {
      method: "POST",
      body: JSON.stringify({ eventId, latitude, longitude }),
    }),

  generateCv: () => request<{ content: string }>("/api/ai/cv", { method: "POST" }),
  generateMotivationLetter: (program?: string) =>
    request<{ content: string }>("/api/ai/motivation-letter", {
      method: "POST",
      body: JSON.stringify(program ? { program } : {}),
    }),

  adminStats: () =>
    request<{
      stats: {
        users: number;
        organizations: number;
        events: number;
        fraudReports: number;
        suspended: number;
        pendingEvents: number;
      };
    }>("/api/admin/stats"),

  adminUsers: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{
      users: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        trustScore: number;
        impactHours: number;
      }[];
      total: number;
      page: number;
      pages: number;
    }>(`/api/admin/users${q ? `?${q}` : ""}`);
  },
  adminUserDetail: (id: string) => request<{ user: unknown }>(`/api/admin/users/${id}`),
  suspendUser: (userId: string, suspended: boolean) =>
    request<{ ok: boolean }>("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId, suspended }) }),
  changeUserRole: (userId: string, role: string) =>
    request<{ ok: boolean }>("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId, role }) }),
  deleteUser: (id: string) => request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),

  adminOrgs: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ organizations: unknown[]; total: number; page: number; pages: number }>(
      `/api/admin/organizations${q ? `?${q}` : ""}`
    );
  },
  adminOrgDetail: (id: string) => request<{ organization: unknown }>(`/api/admin/organizations/${id}`),
  orgAction: (organizationId: string, action: string, data?: Record<string, unknown>) =>
    request<{ ok: boolean }>("/api/admin/organizations", {
      method: "PATCH",
      body: JSON.stringify({ organizationId, action, ...data }),
    }),

  adminEvents: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ events: Event[]; total: number; page: number; pages: number }>(
      `/api/admin/events${q ? `?${q}` : ""}`
    );
  },
  moderateEvent: (eventId: string, action: string, reason?: string) =>
    request<{ event: Event }>("/api/admin/events", {
      method: "PATCH",
      body: JSON.stringify({ eventId, action, reason }),
    }),

  adminFraud: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ reports: unknown[]; total: number; page: number; pages: number }>(
      `/api/admin/fraud${q ? `?${q}` : ""}`
    );
  },
  updateFraud: (id: string, body: { status?: string; adminNotes?: string; assignedToId?: string | null }) =>
    request<{ report: unknown }>(`/api/admin/fraud/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  adminApplications: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ applications: unknown[]; total: number; page: number; pages: number }>(
      `/api/admin/applications${q ? `?${q}` : ""}`
    );
  },
  overrideApplication: (applicationId: string, status: string) =>
    request<{ application: unknown }>("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({ applicationId, status }),
    }),

  adminAttendance: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<{ records: unknown[]; eventConfigs: unknown[] }>(`/api/admin/attendance${q ? `?${q}` : ""}`);
  },

  adminAnalytics: () =>
    request<{
      totals: unknown;
      series: Record<string, { date: string; count: number }[]>;
    }>("/api/admin/analytics"),

  adminSettings: () => request<{ settings: { key: string; value: string }[] }>("/api/admin/settings"),
  updateAdminSettings: (settings: { key: string; value: string }[]) =>
    request<{ settings: { key: string; value: string }[] }>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ settings }),
    }),

  adminAudit: () => request<{ actions: unknown[] }>("/api/admin/audit"),

  verifyOrg: (organizationId: string) =>
    request<{ ok: boolean }>("/api/admin/organizations", {
      method: "PATCH",
      body: JSON.stringify({ organizationId, action: "verify" }),
    }),
};
