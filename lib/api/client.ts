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
  apply: (eventId: string) =>
    request<{ application: unknown }>("/api/applications", { method: "POST", body: JSON.stringify({ eventId }) }),

  applications: () => request<{ applications: { id: string; event: string; org: string; date: string; status: string }[] }>("/api/applications"),
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

  orgApplications: () =>
    request<{ applications: { id: string; name: string; role: string; trust: number; status: string }[] }>("/api/applications"),

  adminStats: () => request<{ stats: { users: number; organizations: number; events: number; fraudReports: number; suspended: number } }>("/api/admin/stats"),
  adminUsers: () => request<{ users: { id: string; name: string; role: string; status: string }[] }>("/api/admin/users"),
  adminOrgs: () => request<{ organizations: { id: string; name: string; status: string }[] }>("/api/admin/organizations"),
  adminFraud: () => request<{ reports: { id: string; type: string; user: string; severity: string }[] }>("/api/admin/fraud"),
  suspendUser: (userId: string, suspended: boolean) =>
    request<{ ok: boolean }>("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId, suspended }) }),
  verifyOrg: (organizationId: string) =>
    request<{ ok: boolean }>("/api/admin/organizations", { method: "PATCH", body: JSON.stringify({ organizationId, action: "verify" }) }),
};
