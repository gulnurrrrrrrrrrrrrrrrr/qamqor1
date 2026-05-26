"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  pending: "text-ink-300 bg-white/[0.06]",
  reviewing: "text-accent-light bg-accent/10",
  accepted: "text-emerald-400 bg-emerald-500/10",
  rejected: "text-red-400 bg-red-500/10",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof api.applications>>["applications"]>([]);

  useEffect(() => {
    api.applications().then((r) => setApplications(r.applications)).catch(console.error);
  }, []);

  return (
    <RoleShell role="volunteer" title="Applications" subtitle="Track application status">
      <Panel className="divide-y divide-white/[0.04] !p-0 overflow-hidden">
        {applications.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
            <div>
              <p className="text-sm text-white">{a.event}</p>
              <p className="text-xs text-ink-400">{a.org} · Applied {a.date}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] uppercase", statusColor[a.status] ?? statusColor.pending)}>{a.status}</span>
          </div>
        ))}
        {applications.length === 0 && <p className="p-8 text-center text-ink-400 text-sm">No applications yet.</p>}
      </Panel>
    </RoleShell>
  );
}
