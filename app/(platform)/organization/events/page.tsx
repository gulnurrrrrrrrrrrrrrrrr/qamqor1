"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import type { Event } from "@/lib/types";

export default function OrgEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const load = useCallback(() => {
    if (!user?.organizationId) return;
    setListLoading(true);
    api
      .events({ organizationId: user.organizationId })
      .then((r) => setEvents(r.events))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load events"))
      .finally(() => setListLoading(false));
  }, [user?.organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreateModal() {
    setModalMode("create");
    setEditingEvent(null);
    setModalOpen(true);
    setError(null);
  }

  function openEditModal(event: Event) {
    setModalMode("edit");
    setEditingEvent(event);
    setModalOpen(true);
    setError(null);
  }

  function handleModalSuccess(message: string) {
    setSuccess(message);
    setError(null);
    load();
  }

  async function handleDelete(e: Event) {
    if (!window.confirm(`Delete "${e.title}"?`)) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.deleteEvent(e.id);
      setSuccess("Event deleted");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <RoleShell role="organization" title="Events" subtitle="Create · Edit · Delete">
      <div className="flex justify-end mb-6">
        <Can permission="events.create">
          <Button size="sm" onClick={openCreateModal} disabled={actionLoading}>
            <Plus size={14} /> Create Event
          </Button>
        </Can>
      </div>

      <ActionFeedback loading={actionLoading} error={error} success={success} />

      <CreateEventModal
        open={modalOpen}
        mode={modalMode}
        event={editingEvent}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {listLoading ? (
        <div className="h-32 animate-pulse bg-white/[0.04] rounded-xl" />
      ) : events.length === 0 ? (
        <Panel>
          <p className="text-sm text-ink-400 text-center py-6">No events yet. Create your first event to get started.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Panel key={e.id} className="flex items-center justify-between !py-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm text-white">{e.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {e.date} · {e.location} · {e.participants}/{e.maxParticipants} volunteers
                </p>
                {e.description && (
                  <p className="text-xs text-ink-500 mt-1 line-clamp-2">{e.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Can permission="events.edit">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(e)} disabled={actionLoading}>
                    Edit
                  </Button>
                </Can>
                <Can permission="events.delete">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={() => handleDelete(e)}
                    disabled={actionLoading}
                  >
                    Delete
                  </Button>
                </Can>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </RoleShell>
  );
}
