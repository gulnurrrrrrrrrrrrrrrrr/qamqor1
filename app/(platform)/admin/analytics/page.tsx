"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

function MiniChart({ title, data }: { title: string; data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Panel>
      <p className="text-xs text-ink-500 uppercase mb-3">{title}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-accent/60 rounded-t" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0 }} title={`${d.count}`} />
            <span className="text-[8px] text-ink-600 rotate-0">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminAnalytics>> | null>(null);

  useEffect(() => {
    api.adminAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <RoleShell role="admin" title="Analytics" subtitle="Loading…"><div className="h-48 animate-pulse bg-white/[0.04] rounded-xl" /></RoleShell>;
  }

  const t = data.totals as { users: number; events: number; fraudReports: number; pendingEvents: number };

  return (
    <RoleShell role="admin" title="Platform Analytics" subtitle="14-day activity overview">
      <Can permission="analytics.platform">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Panel><p className="text-2xl font-semibold text-white">{t.users}</p><p className="text-xs text-ink-500">Total users</p></Panel>
          <Panel><p className="text-2xl font-semibold text-white">{t.events}</p><p className="text-xs text-ink-500">Total events</p></Panel>
          <Panel><p className="text-2xl font-semibold text-amber-400">{t.pendingEvents}</p><p className="text-xs text-ink-500">Pending moderation</p></Panel>
          <Panel><p className="text-2xl font-semibold text-red-400">{t.fraudReports}</p><p className="text-xs text-ink-500">Open fraud</p></Panel>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <MiniChart title="New users" data={data.series.users} />
          <MiniChart title="Events created" data={data.series.events} />
          <MiniChart title="Applications" data={data.series.applications} />
          <MiniChart title="Fraud reports" data={data.series.fraud} />
          <MiniChart title="Check-ins" data={data.series.attendance} />
        </div>
      </Can>
    </RoleShell>
  );
}
