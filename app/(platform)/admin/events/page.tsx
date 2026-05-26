"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.events().then((r) => setEvents(r.events.slice(0, 10))).catch(console.error);

  useEffect(() => { load(); }, []);

  async function handleApprove(e: Event) {
    setLoading(e.id);
    setError(null);
    setSuccess(null);
    try {
      await api.updateEvent(e.id, { featured: true });
      setSuccess(`Approved ${e.title}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleRemove(e: Event) {
    if (!window.confirm(`Remove "${e.title}" from platform?`)) return;
    setLoading(e.id);
    setError(null);
    try {
      await api.deleteEvent(e.id);
      setSuccess(`Removed ${e.title}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <RoleShell role="admin" title="Event Moderation" subtitle="Review flagged content">
      <ActionFeedback loading={!!loading} error={error} success={success} />
      {events.map((e) => (
        <Panel key={e.id} className="flex justify-between items-center mb-3 !py-4">
          <div>
            <p className="text-sm text-white">{e.title}</p>
            <p className="text-xs text-ink-500">{e.org}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleApprove(e)} disabled={loading === e.id}>
              {loading === e.id ? "…" : "Approve"}
            </Button>
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleRemove(e)} disabled={loading === e.id}>
              Remove
            </Button>
          </div>
        </Panel>
      ))}
    </RoleShell>
  );
}
