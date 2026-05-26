"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  trustScore: number;
  impactHours: number;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ users: UserRow[]; pages: number }>({ users: [], pages: 1 });
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({});

  const load = useCallback(() => {
    api.adminUsers({ search, role, page: String(page) }).then((r) => setData({ users: r.users as UserRow[], pages: r.pages })).catch((e) =>
      setFeedback({ error: e.message })
    );
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id: string) {
    const res = await api.adminUserDetail(id);
    setDetail(res.user as Record<string, unknown>);
    setDrawerOpen(true);
  }

  const columns: AdminColumn<UserRow>[] = [
    { key: "name", header: "Name", render: (u) => <span className="text-white">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => <span className="capitalize">{u.role}</span> },
    { key: "trust", header: "Trust", render: (u) => u.trustScore },
    { key: "hours", header: "Hours", render: (u) => u.impactHours },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
  ];

  return (
    <RoleShell role="admin" title="Users" subtitle="Search · Suspend · Audit activity">
      <Can permission="users.manage">
        <AdminFilters
          fields={[
            { key: "search", label: "Search", type: "search", value: search, placeholder: "Name or email…" },
            {
              key: "role",
              label: "Role",
              type: "select",
              value: role,
              options: [
                { value: "all", label: "All roles" },
                { value: "volunteer", label: "Volunteer" },
                { value: "organization", label: "Organization" },
              ],
            },
          ]}
          onChange={(k, v) => {
            if (k === "search") setSearch(v);
            if (k === "role") setRole(v);
            setPage(1);
          }}
        />
        <ActionFeedback error={feedback.error} success={feedback.success} />
        <AdminTable columns={columns} data={data.users} keyField="id" onRowClick={(u) => openDetail(u.id)} />
        <div className="flex justify-center gap-2 mt-4">
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-xs text-ink-400 self-center">Page {page} / {data.pages}</span>
          <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>

        <AdminDetailDrawer
          open={drawerOpen}
          title={String(detail?.name ?? "User")}
          onClose={() => setDrawerOpen(false)}
          footer={
            detail && (
              <>
                <Can permission="accounts.suspend">
                  {detail.suspended ? (
                    <Button size="sm" onClick={() => api.suspendUser(String(detail.id), false).then(() => { load(); openDetail(String(detail.id)); })}>Restore</Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="text-red-400" onClick={() => api.suspendUser(String(detail.id), true).then(() => { load(); openDetail(String(detail.id)); })}>Suspend</Button>
                  )}
                </Can>
                <Can permission="users.manage">
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => {
                    if (confirm("Delete user permanently?")) api.deleteUser(String(detail.id)).then(() => { setDrawerOpen(false); load(); });
                  }}>Delete</Button>
                </Can>
              </>
            )
          }
        >
          {detail && (
            <>
              <p><span className="text-ink-500">Email:</span> {String(detail.email)}</p>
              <p><span className="text-ink-500">Role:</span> {String(detail.role)}</p>
              <p><span className="text-ink-500">Trust:</span> {String(detail.trustScore)} · Hours: {String(detail.impactHours)}</p>
              <p className="text-xs text-ink-500 uppercase mt-4">Recent applications</p>
              {(detail.applications as { event: string; status: string }[] | undefined)?.slice(0, 5).map((a, i) => (
                <p key={i} className="text-xs">{a.event} — <StatusBadge status={a.status} /></p>
              ))}
              <p className="text-xs text-ink-500 uppercase mt-4">Attendance</p>
              {(detail.attendance as { event: string; method: string }[] | undefined)?.slice(0, 5).map((a, i) => (
                <p key={i} className="text-xs">{a.event} ({a.method})</p>
              ))}
            </>
          )}
        </AdminDetailDrawer>
      </Can>
    </RoleShell>
  );
}
