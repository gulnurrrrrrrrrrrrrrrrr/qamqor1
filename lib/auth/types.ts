export type Role = "volunteer" | "organization" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string | null;
  trustScore?: number;
}

export const ROLE_HOME: Record<Role, string> = {
  volunteer: "/volunteer",
  organization: "/organization",
  admin: "/admin",
};
