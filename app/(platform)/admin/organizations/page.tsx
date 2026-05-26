"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Awaited<ReturnType<typeof api.adminOrgs>>["organizations"]>([]);

  const load = () => api.adminOrgs().then((r) => setOrgs(r.organizations)).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <RoleShell role="admin" title="Organizations" subtitle="Verify · Moderate">
      <div className="space-y-3">
        {orgs.map((o) => (
          <Panel key={o.id} className="flex justify-between items-center !py-4">
            <div>
              <p className="text-sm text-white">{o.name}</p>
              <p className="text-xs text-ink-500 capitalize">{o.status}</p>
            </div>
            {o.status === "pending" && (
              <Button size="sm" onClick={() => api.verifyOrg(o.id).then(load)}>Verify</Button>
            )}
          </Panel>
        ))}
      </div>
    </RoleShell>
  );
}
