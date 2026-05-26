"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, ShieldAlert, BarChart3, ArrowRight } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  approved: "text-emerald-400 bg-emerald-500/10",
  screening: "text-accent-light bg-accent/10",
  pending: "text-ink-300 bg-white/[0.06]",
  flagged: "text-red-400 bg-red-500/10",
};

export default function OrganizationHome() {
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof api.orgAnalytics>> | null>(null);
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof api.orgApplications>>["applications"]>([]);

  useEffect(() => {
    Promise.all([api.orgAnalytics(), api.orgApplications()])
      .then(([a, apps]) => { setAnalytics(a); setApplications(apps.applications); })
      .catch(console.error);
  }, []);

  if (!analytics) return <RoleShell role="organization" title="Recruitment Hub" subtitle="Loading…"><div className="h-64 animate-pulse bg-white/[0.04] rounded-2xl" /></RoleShell>;

  return (
    <RoleShell role="organization" title="Recruitment Hub" subtitle={analytics.org?.name ?? "Organization"}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={BarChart3} label="Active Events" value={analytics.totalEvents} />
        <Stat icon={Users} label="Volunteers" value={analytics.activeVolunteers} />
        <Stat icon={Clock} label="Verified Hours" value={analytics.verifiedHours.toLocaleString()} />
        <Stat icon={ShieldAlert} label="Fraud Alerts" value={analytics.fraudAlerts} alert />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex justify-between items-center">
            <h2 className="text-sm font-medium text-white">Recent Applications</h2>
            <Link href="/organization/applications" className="text-xs text-accent-light flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {applications.slice(0, 4).map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center text-xs text-gold">{v.name[0]}</div>
                <div><p className="text-sm text-white">{v.name}</p><p className="text-xs text-ink-400">Trust {v.trust}</p></div>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase", statusStyle[v.status] ?? statusStyle.pending)}>{v.status}</span>
            </div>
          ))}
        </Panel>
        <div className="space-y-4">
          <QuickLink href="/organization/events" label="Manage Events" />
          <QuickLink href="/organization/attendance" label="Verify Attendance" />
          <QuickLink href="/organization/analytics" label="View Analytics" />
        </div>
      </div>
    </RoleShell>
  );
}

function Stat({ icon: Icon, label, value, alert }: { icon: React.ElementType; label: string; value: string | number; alert?: boolean }) {
  return (
    <Panel>
      <Icon size={18} className={alert ? "text-red-400" : "text-ink-400"} />
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </Panel>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="block glass-raised rounded-xl px-4 py-3 text-sm text-ink-200 hover:text-white transition">{label} →</Link>;
}
