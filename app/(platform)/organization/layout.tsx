"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="organization">{children}</RoleGuard>;
}
