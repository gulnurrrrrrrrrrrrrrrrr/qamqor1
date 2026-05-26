"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Can } from "@/components/auth/Can";
import { api } from "@/lib/api/client";

export default function AdminHome() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.adminStats>>["stats"] | null>(null);

  useEffect(() => {
    api.adminStats().then((r) => setStats(r.stats)).catch(console.error);
  }, []);

  return (
    <RoleShell role="admin" title="System Control" subtitle="Platform operations · Secure access">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <AdminStat label="Users" value={stats?.users.toLocaleString() ?? "—"} />
        <AdminStat label="Organizations" value={stats?.organizations ?? "—"} />
        <AdminStat label="Events" value={stats?.events ?? "—"} />
        <AdminStat label="Pending Events" value={stats?.pendingEvents ?? "—"} alert />
        <AdminStat label="Open Fraud" value={stats?.fraudReports ?? "—"} alert />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: "/admin/analytics", label: "Analytics", desc: "Charts & trends", permission: "analytics.platform" as const },
          { href: "/admin/users", label: "Users", desc: "Suspend · Roles · Audit", permission: "users.manage" as const },
          { href: "/admin/organizations", label: "Organizations", desc: "Verify · Reject · Suspend", permission: "organizations.manage" as const },
          { href: "/admin/events", label: "Event Moderation", desc: `${stats?.pendingEvents ?? 0} pending`, permission: "events.moderate" as const },
          { href: "/admin/applications", label: "Applications", desc: "Override decisions", permission: "users.manage" as const },
          { href: "/admin/attendance", label: "Attendance", desc: "Fraud monitoring", permission: "verification.monitor" as const },
          { href: "/admin/fraud", label: "Fraud & Reports", desc: `${stats?.fraudReports ?? 0} open`, permission: "fraud.review" as const },
          { href: "/admin/settings", label: "Settings", desc: "Platform config", permission: "settings.system" as const },
        ].map((item) => (
          <Can key={item.href} permission={item.permission}>
            <Link href={item.href} className="glass-raised rounded-xl p-4 border border-white/[0.04] hover:border-red-500/20 transition block h-full">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-ink-500 mt-1">{item.desc}</p>
            </Link>
          </Can>
        ))}
      </div>
    </RoleShell>
  );
}

function AdminStat({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <Panel className={alert ? "border-red-500/20" : ""}>
      <p className={`text-2xl font-semibold ${alert ? "text-red-400" : "text-white"}`}>{value}</p>
      <p className="text-xs text-ink-500 mt-1 uppercase tracking-wider">{label}</p>
    </Panel>
  );
}
