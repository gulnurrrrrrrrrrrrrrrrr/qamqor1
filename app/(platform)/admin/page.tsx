"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

export default function AdminHome() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.adminStats>>["stats"] | null>(null);

  useEffect(() => {
    api.adminStats().then((r) => setStats(r.stats)).catch(console.error);
  }, []);

  return (
    <RoleShell role="admin" title="System Control" subtitle="Platform operations · Secure access">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStat label="Users" value={stats?.users.toLocaleString() ?? "—"} />
        <AdminStat label="Organizations" value={stats?.organizations ?? "—"} />
        <AdminStat label="Events" value={stats?.events ?? "—"} />
        <AdminStat label="Fraud Reports" value={stats?.fraudReports ?? "—"} alert />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: "/admin/users", label: "Manage Users", desc: "Suspend · Review accounts" },
          { href: "/admin/organizations", label: "Organizations", desc: "Verify · Moderate" },
          { href: "/admin/fraud", label: "Fraud Queue", desc: `${stats?.fraudReports ?? 0} open reports` },
          { href: "/admin/events", label: "Event Moderation", desc: "Review flagged events" },
          { href: "/admin/reports", label: "Reports", desc: "Abuse · Policy violations" },
          { href: "/admin/settings", label: "System Settings", desc: "Verification · Platform config" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass-raised rounded-xl p-4 border border-white/[0.04] hover:border-red-500/20 transition">
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="text-xs text-ink-500 mt-1">{item.desc}</p>
          </Link>
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
