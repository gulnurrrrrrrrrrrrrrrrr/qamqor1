"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="volunteer">{children}</RoleGuard>;
}
