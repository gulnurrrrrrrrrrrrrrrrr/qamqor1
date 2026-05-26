"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

export default function OrgAnalyticsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.orgAnalytics>> | null>(null);

  useEffect(() => {
    api.orgAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) return <RoleShell role="organization" title="Analytics" subtitle="Loading…"><div className="h-64 animate-pulse bg-white/[0.04] rounded-2xl" /></RoleShell>;

  return (
    <RoleShell role="organization" title="Analytics" subtitle="Performance · Reliability · Impact">
      <Panel className="mb-6">
        <p className="text-xs text-ink-400">Average volunteer trust</p>
        <p className="text-3xl font-semibold text-white mt-1">{data.avgTrust}</p>
      </Panel>
      <Panel>
        <h2 className="text-sm font-medium text-white mb-6">Event Performance</h2>
        {data.eventPerformance.map((e) => (
          <div key={e.name} className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-200">{e.name}</span>
              <span className="text-ink-400">{e.hours}h verified</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold" style={{ width: `${e.fill}%` }} />
            </div>
          </div>
        ))}
      </Panel>
    </RoleShell>
  );
}
