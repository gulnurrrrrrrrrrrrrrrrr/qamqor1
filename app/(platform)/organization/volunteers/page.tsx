"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

export default function OrgVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Awaited<ReturnType<typeof api.orgApplications>>["applications"]>([]);

  useEffect(() => {
    api.orgApplications().then((r) => setVolunteers(r.applications)).catch(console.error);
  }, []);

  return (
    <RoleShell role="organization" title="Volunteers" subtitle="Trust · Skills · Participation history">
      <div className="grid sm:grid-cols-2 gap-4">
        {volunteers.map((v) => (
          <Panel key={v.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white">{v.name}</p>
                <p className="text-xs text-ink-400">{v.role}</p>
              </div>
              <span className="text-lg font-semibold text-accent-light">{v.trust}</span>
            </div>
            <div className="mt-4 flex gap-2 text-[10px] text-ink-400">
              <span className="rounded bg-white/[0.04] px-2 py-1">Status: {v.status}</span>
            </div>
          </Panel>
        ))}
      </div>
    </RoleShell>
  );
}
