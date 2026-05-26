"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";

export default function AdminFraudPage() {
  const [reports, setReports] = useState<Awaited<ReturnType<typeof api.adminFraud>>["reports"]>([]);

  useEffect(() => {
    api.adminFraud().then((r) => setReports(r.reports)).catch(console.error);
  }, []);

  return (
    <RoleShell role="admin" title="Fraud Reports" subtitle="Abuse detection · Verification monitor">
      {reports.map((r) => (
        <Panel key={r.id} className="mb-3 flex justify-between items-start">
          <div>
            <p className="text-sm text-white">{r.type}</p>
            <p className="text-xs text-ink-500">{r.user} · {r.severity}</p>
          </div>
          <Button size="sm" variant="secondary">Investigate</Button>
        </Panel>
      ))}
    </RoleShell>
  );
}
