"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

type AppRow = { id: string; volunteer: string; email: string; trust: number; event: string; org: string; status: string };

export default function AdminApplicationsPage() {
  const [status, setStatus] = useState("all");
  const [apps, setApps] = useState<AppRow[]>([]);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const load = () => api.adminApplications({ status }).then((r) => setApps(r.applications as AppRow[])).catch((e) => setMsg({ error: e.message }));
  useEffect(() => { load(); }, [status]);

  const columns: AdminColumn<AppRow>[] = [
    { key: "volunteer", header: "Volunteer", render: (a) => <span className="text-white">{a.volunteer}</span> },
    { key: "email", header: "Email", render: (a) => a.email },
    { key: "event", header: "Event", render: (a) => a.event },
    { key: "org", header: "Org", render: (a) => a.org },
    { key: "trust", header: "Trust", render: (a) => a.trust },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      header: "Override",
      render: (a) => (
        <Can permission="users.manage">
          <div className="flex gap-1">
            <Button size="sm" onClick={() => api.overrideApplication(a.id, "APPROVED").then(() => { setMsg({ success: "Approved" }); load(); })}>Approve</Button>
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => api.overrideApplication(a.id, "REJECTED").then(load)}>Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => api.overrideApplication(a.id, "FLAGGED").then(load)}>Flag</Button>
          </div>
        </Can>
      ),
    },
  ];

  return (
    <RoleShell role="admin" title="Applications" subtitle="Platform-wide application oversight">
      <Can permission="users.manage">
        <AdminFilters
          fields={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              options: [
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "flagged", label: "Flagged" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ],
            },
          ]}
          onChange={(k, v) => k === "status" && setStatus(v)}
        />
        <ActionFeedback error={msg.error} success={msg.success} />
        <AdminTable columns={columns} data={apps} keyField="id" />
      </Can>
    </RoleShell>
  );
}
