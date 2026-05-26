"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

export default function AdminFraudPage() {
  const [reports, setReports] = useState<Awaited<ReturnType<typeof api.adminFraud>>["reports"]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.adminFraud().then((r) => setReports(r.reports)).catch(console.error);

  useEffect(() => { load(); }, []);

  async function handleInvestigate(id: string) {
    setLoadingId(id);
    setError(null);
    setSuccess(null);
    try {
      await api.investigateFraud(id);
      setSuccess("Report marked as investigating");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <RoleShell role="admin" title="Fraud Reports" subtitle="Abuse detection · Verification monitor">
      <ActionFeedback loading={!!loadingId} error={error} success={success} />
      {reports.map((r) => (
        <Panel key={r.id} className="mb-3 flex justify-between items-start">
          <div>
            <p className="text-sm text-white">{r.type}</p>
            <p className="text-xs text-ink-500">{r.user} · {r.severity}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => handleInvestigate(r.id)} disabled={loadingId === r.id}>
            {loadingId === r.id ? "…" : "Investigate"}
          </Button>
        </Panel>
      ))}
    </RoleShell>
  );
}
