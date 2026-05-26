"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

type OrgRow = { id: string; name: string; status: string; ownerEmail: string; eventCount: number };

export default function AdminOrgsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const load = useCallback(() => {
    api.adminOrgs({ search, status }).then((r) => setOrgs(r.organizations as OrgRow[])).catch((e) => setMsg({ error: e.message }));
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  const columns: AdminColumn<OrgRow>[] = [
    { key: "name", header: "Organization", render: (o) => <span className="text-white">{o.name}</span> },
    { key: "email", header: "Owner", render: (o) => o.ownerEmail },
    { key: "events", header: "Events", render: (o) => o.eventCount },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (o) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Can permission="organizations.verify">
            {o.status === "pending" && <Button size="sm" onClick={() => api.orgAction(o.id, "verify").then(() => { setMsg({ success: "Verified" }); load(); })}>Verify</Button>}
          </Can>
          <Can permission="organizations.manage">
            {o.status !== "rejected" && <Button size="sm" variant="ghost" className="text-red-400" onClick={() => api.orgAction(o.id, "reject").then(load)}>Reject</Button>}
            {o.status !== "suspended" && <Button size="sm" variant="ghost" onClick={() => api.orgAction(o.id, "suspend").then(load)}>Suspend</Button>}
          </Can>
        </div>
      ),
    },
  ];

  return (
    <RoleShell role="admin" title="Organizations" subtitle="Verify · Reject · Suspend">
      <Can permission="organizations.manage">
        <AdminFilters
          fields={[
            { key: "search", label: "Search", type: "search", value: search, placeholder: "Organization name…" },
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              options: [
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "verified", label: "Verified" },
                { value: "suspended", label: "Suspended" },
                { value: "rejected", label: "Rejected" },
              ],
            },
          ]}
          onChange={(k, v) => {
            if (k === "search") setSearch(v);
            if (k === "status") setStatus(v);
          }}
        />
        <ActionFeedback error={msg.error} success={msg.success} />
        <AdminTable columns={columns} data={orgs} keyField="id" />
      </Can>
    </RoleShell>
  );
}
