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
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [status, setStatus] = useState("pending");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const load = useCallback(() => {
    api.adminEvents({ status, flagged: flaggedOnly ? "true" : "" }).then((r) => setEvents(r.events)).catch((e) => setMsg({ error: e.message }));
  }, [status, flaggedOnly]);

  useEffect(() => { load(); }, [load]);

  async function act(eventId: string, action: string) {
    let reason: string | undefined;
    if (action === "reject") reason = window.prompt("Rejection reason") ?? "Policy violation";
    setMsg({});
    try {
      await api.moderateEvent(eventId, action, reason);
      setMsg({ success: `Event ${action}d` });
      load();
    } catch (e) {
      setMsg({ error: e instanceof Error ? e.message : "Failed" });
    }
  }

  const columns: AdminColumn<Event>[] = [
    { key: "title", header: "Event", render: (e) => <span className="text-white">{e.title}</span> },
    { key: "org", header: "Organization", render: (e) => e.org },
    { key: "status", header: "Status", render: (e) => <StatusBadge status={e.moderationStatus ?? "pending"} /> },
    { key: "flag", header: "Flagged", render: (e) => (e.flagged ? <StatusBadge status="flagged" /> : "—") },
    {
      key: "actions",
      header: "Moderation",
      render: (e) => (
        <div className="flex flex-wrap gap-1">
          <Can permission="events.moderate">
            <Button size="sm" onClick={() => act(e.id, "approve")}>Approve</Button>
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => act(e.id, "reject")}>Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => act(e.id, e.flagged ? "unflag" : "flag")}>{e.flagged ? "Unflag" : "Flag"}</Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <RoleShell role="admin" title="Event Moderation" subtitle="Approve · Reject · Flag suspicious events">
      <Can permission="events.moderate">
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
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ],
            },
            {
              key: "flagged",
              label: "Flagged",
              type: "select",
              value: flaggedOnly ? "yes" : "no",
              options: [
                { value: "no", label: "All events" },
                { value: "yes", label: "Flagged only" },
              ],
            },
          ]}
          onChange={(k, v) => {
            if (k === "status") setStatus(v);
            if (k === "flagged") setFlaggedOnly(v === "yes");
          }}
        />
        <ActionFeedback error={msg.error} success={msg.success} />
        <AdminTable columns={columns} data={events} keyField="id" emptyMessage="No events match filters." />
      </Can>
    </RoleShell>
  );
}
