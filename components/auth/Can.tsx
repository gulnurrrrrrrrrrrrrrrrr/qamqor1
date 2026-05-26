"use client";

import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/lib/auth/permissions";

export function Can({ permission, children, fallback = null }: { permission: Permission; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
