"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof api.adminUsers>>["users"]>([]);

  const load = () => api.adminUsers().then((r) => setUsers(r.users)).catch(console.error);
  useEffect(() => { load(); }, []);

  async function toggleSuspend(userId: string, suspended: boolean) {
    await api.suspendUser(userId, suspended);
    load();
  }

  return (
    <RoleShell role="admin" title="Users" subtitle="Manage accounts">
      <Panel className="!p-0 overflow-hidden">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-sm text-white">{u.name}</p>
              <p className="text-xs text-ink-500 capitalize">{u.role} · {u.status}</p>
            </div>
            {u.status !== "suspended" ? (
              <Button size="sm" variant="ghost" className="text-red-400 text-xs" onClick={() => toggleSuspend(u.id, true)}>Suspend</Button>
            ) : (
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggleSuspend(u.id, false)}>Restore</Button>
            )}
          </div>
        ))}
      </Panel>
    </RoleShell>
  );
}
