"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/auth/types";
import { ROLE_HOME } from "@/lib/auth/types";

export function RoleGuard({ role: allowed, children }: { role: Role; children: React.ReactNode }) {
  const { role, loading, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    if (!role) router.replace("/onboarding");
    else if (role !== allowed) router.replace(ROLE_HOME[role]);
  }, [role, allowed, loading, router]);

  if (loading || role !== allowed) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
