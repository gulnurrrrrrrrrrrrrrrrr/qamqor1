"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";

export default function OrgProfilePage() {
  const [org, setOrg] = useState<{ name: string; logo: string; description: string | null; verified: boolean } | null>(null);

  useEffect(() => {
    api.orgProfile().then((r) => setOrg(r.organization)).catch(console.error);
  }, []);

  return (
    <RoleShell role="organization" title="Organization Profile" subtitle="Public identity · Verification">
      <Panel className="max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center text-lg font-semibold text-gold">{org?.logo ?? "—"}</div>
          <div>
            <p className="text-lg font-medium text-white">{org?.name ?? "…"}</p>
            <p className="text-xs text-emerald-400">{org?.verified ? "Verified Organization" : "Pending verification"}</p>
          </div>
        </div>
        <p className="text-sm text-ink-300">{org?.description}</p>
        <Button variant="secondary" size="sm" className="mt-6">Edit Profile</Button>
      </Panel>
    </RoleShell>
  );
}
