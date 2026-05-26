"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.events().then((r) => setEvents(r.events.slice(0, 10))).catch(console.error);
  }, []);

  return (
    <RoleShell role="admin" title="Event Moderation" subtitle="Review flagged content">
      {events.map((e) => (
        <Panel key={e.id} className="flex justify-between items-center mb-3 !py-4">
          <div>
            <p className="text-sm text-white">{e.title}</p>
            <p className="text-xs text-ink-500">{e.org}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Approve</Button>
            <Button size="sm" variant="ghost" className="text-red-400">Remove</Button>
          </div>
        </Panel>
      ))}
    </RoleShell>
  );
}
