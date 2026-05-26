"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";

type Report = {
  id: string;
  type: string;
  description?: string;
  user: string;
  severity: string;
  status: string;
  adminNotes?: string;
  eventTitle?: string;
};

export default function AdminFraudPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState<Report[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const load = () =>
    api.adminFraud({ status }).then((r) => setReports(r.reports as Report[])).catch((e) => setMsg({ error: e.message }));

  useEffect(() => { load(); }, [status]);

  async function update(id: string, patch: { status?: string; adminNotes?: string; assignedToId?: string | null }) {
    try {
      await api.updateFraud(id, patch);
      setMsg({ success: "Report updated" });
      load();
    } catch (e) {
      setMsg({ error: e instanceof Error ? e.message : "Failed" });
    }
  }

  return (
    <RoleShell role="admin" title="Fraud & Reports" subtitle="Investigate · Resolve · Audit trail">
      <Can permission="fraud.review">
        <AdminFilters
          fields={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              options: [
                { value: "all", label: "All" },
                { value: "open", label: "Open" },
                { value: "investigating", label: "Investigating" },
                { value: "resolved", label: "Resolved" },
              ],
            },
          ]}
          onChange={(k, v) => k === "status" && setStatus(v)}
        />
        <ActionFeedback error={msg.error} success={msg.success} />
        <div className="space-y-3">
          {reports.map((r) => (
            <Panel key={r.id}>
              <div className="flex justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm text-white">{r.type}</p>
                  <p className="text-xs text-ink-500">{r.user} · {r.eventTitle && `Event: ${r.eventTitle}`}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={r.severity} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
              {r.description && <p className="text-xs text-ink-400 mb-3">{r.description}</p>}
              <textarea
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-xs text-white mb-2"
                rows={2}
                placeholder="Admin notes…"
                value={notes[r.id] ?? r.adminNotes ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => update(r.id, { status: "investigating", assignedToId: user?.id ?? null, adminNotes: notes[r.id] })}>Investigate</Button>
                <Button size="sm" onClick={() => update(r.id, { status: "resolved", adminNotes: notes[r.id] })}>Resolve</Button>
                <Button size="sm" variant="ghost" onClick={() => update(r.id, { adminNotes: notes[r.id] })}>Save notes</Button>
              </div>
            </Panel>
          ))}
        </div>
      </Can>
    </RoleShell>
  );
}
