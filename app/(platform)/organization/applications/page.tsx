"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  approved: "text-emerald-400 bg-emerald-500/10",
  screening: "text-accent-light bg-accent/10",
  pending: "text-ink-300 bg-white/[0.06]",
  flagged: "text-red-400 bg-red-500/10",
};

export default function OrgApplicationsPage() {
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof api.orgApplications>>["applications"]>([]);

  const load = () => api.orgApplications().then((r) => setApplications(r.applications)).catch(console.error);
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await api.updateApplication(id, status);
    load();
  }

  return (
    <RoleShell role="organization" title="Applications" subtitle="Review · Approve · Reject">
      <Panel className="!p-0 overflow-hidden divide-y divide-white/[0.04]">
        {applications.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-sm text-accent-light">{v.name.split(" ").map((n) => n[0]).join("")}</div>
              <div>
                <p className="text-sm text-white">{v.name}</p>
                <p className="text-xs text-ink-400">{v.role} · Trust {v.trust}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] uppercase", statusStyle[v.status] ?? statusStyle.pending)}>{v.status}</span>
              <Button size="sm" variant="secondary" onClick={() => updateStatus(v.id, "approved")}>Approve</Button>
              <Button size="sm" variant="ghost" className="text-red-400" onClick={() => updateStatus(v.id, "rejected")}>Reject</Button>
            </div>
          </div>
        ))}
      </Panel>
    </RoleShell>
  );
}
