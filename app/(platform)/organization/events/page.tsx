"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import type { Event } from "@/lib/types";

export default function OrgEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => {
    if (!user?.organizationId) return;
    api.events({ organizationId: user.organizationId }).then((r) => setEvents(r.events)).catch(console.error);
  };

  useEffect(() => { load(); }, [user?.organizationId]);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const title = window.prompt("Event title");
      if (!title) return;
      const location = window.prompt("Location", "Almaty") ?? "Almaty";
      await api.createEvent({
        title,
        location,
        mode: "OFFLINE",
        verification: "QR",
        trustRequired: 50,
        hours: 8,
        maxParticipants: 20,
        eventDate: new Date().toISOString(),
        skills: [],
      });
      setSuccess("Event created");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: Event) {
    setLoading(true);
    setError(null);
    try {
      const title = window.prompt("Title", e.title);
      if (!title) return;
      const location = window.prompt("Location", e.location) ?? e.location;
      await api.updateEvent(e.id, { title, location });
      setSuccess("Event updated");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e: Event) {
    if (!window.confirm(`Delete "${e.title}"?`)) return;
    setLoading(true);
    setError(null);
    try {
      await api.deleteEvent(e.id);
      setSuccess("Event deleted");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleShell role="organization" title="Events" subtitle="Create · Edit · Delete">
      <div className="flex justify-end mb-6">
        <Can permission="events.create">
          <Button size="sm" onClick={handleCreate} disabled={loading}><Plus size={14} /> Create Event</Button>
        </Can>
      </div>
      <ActionFeedback loading={loading} error={error} success={success} />
      <div className="space-y-3">
        {events.map((e) => (
          <Panel key={e.id} className="flex items-center justify-between !py-4">
            <div>
              <p className="text-sm text-white">{e.title}</p>
              <p className="text-xs text-ink-400">{e.date} · {e.participants}/{e.maxParticipants} volunteers</p>
            </div>
            <div className="flex gap-2">
              <Can permission="events.edit"><Button variant="ghost" size="sm" onClick={() => handleEdit(e)} disabled={loading}>Edit</Button></Can>
              <Can permission="events.delete"><Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(e)} disabled={loading}>Delete</Button></Can>
            </div>
          </Panel>
        ))}
      </div>
    </RoleShell>
  );
}
