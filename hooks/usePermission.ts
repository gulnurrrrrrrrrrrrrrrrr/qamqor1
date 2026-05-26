"use client";

import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/lib/auth/permissions";

export function usePermission(permission: Permission) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}
