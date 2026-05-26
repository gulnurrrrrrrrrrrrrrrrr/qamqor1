"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/lib/types";
import { api } from "@/lib/api/client";

export default function SavedPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.bookmarks().then((r) => setEvents(r.events)).catch(console.error);
  }, []);

  return (
    <RoleShell role="volunteer" title="Saved Events" subtitle="Bookmarked opportunities">
      <div className="grid sm:grid-cols-2 gap-5">
        {events.map((e) => <EventCard key={e.id} event={e} bookmarked />)}
        {events.length === 0 && <p className="col-span-full text-center py-16 text-ink-400">No saved events.</p>}
      </div>
    </RoleShell>
  );
}
