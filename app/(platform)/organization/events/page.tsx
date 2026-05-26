"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import type { Event } from "@/lib/types";

export default function OrgEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user?.organizationId) return;
    api.events({ organizationId: user.organizationId }).then((r) => setEvents(r.events)).catch(console.error);
  }, [user?.organizationId]);

  return (
    <RoleShell role="organization" title="Events" subtitle="Create · Edit · Delete">
      <div className="flex justify-end mb-6">
        <Can permission="events.create"><Button size="sm"><Plus size={14} /> Create Event</Button></Can>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <Panel key={e.id} className="flex items-center justify-between !py-4">
            <div>
              <p className="text-sm text-white">{e.title}</p>
              <p className="text-xs text-ink-400">{e.date} · {e.participants}/{e.maxParticipants} volunteers</p>
            </div>
            <div className="flex gap-2">
              <Can permission="events.edit"><Button variant="ghost" size="sm">Edit</Button></Can>
              <Can permission="events.delete"><Button variant="ghost" size="sm" className="text-red-400">Delete</Button></Can>
            </div>
          </Panel>
        ))}
      </div>
    </RoleShell>
  );
}
