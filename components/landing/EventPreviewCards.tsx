"use client";

import { memo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/events/EventCard";

export const EventPreviewCards = memo(function EventPreviewCards({ items }: { items: Event[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {items.map((e, i) => (
        <div key={e.id} className="animate-in-view" style={{ animationDelay: `${i * 120}ms` }}>
          <EventCard event={e} compact />
        </div>
      ))}
    </div>
  );
});
