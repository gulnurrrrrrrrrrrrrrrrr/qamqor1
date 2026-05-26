"use client";

import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";

export default function AdminReportsPage() {
  return (
    <RoleShell role="admin" title="Reports" subtitle="Policy violations · User reports">
      <Panel>
        <p className="text-sm text-ink-300">No open abuse reports requiring immediate action.</p>
        <p className="text-xs text-ink-500 mt-2">Last system scan: 12 minutes ago</p>
      </Panel>
    </RoleShell>
  );
}
