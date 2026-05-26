"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Filters } from "@/components/marketplace/Filters";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { api } from "@/lib/api/client";

const ApplyModal = dynamic(
  () => import("@/components/marketplace/ApplyModal").then((m) => m.ApplyModal),
  { ssr: false }
);

export function OpportunitiesView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [mode, setMode] = useState("All");
  const [verification, setVerification] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [applyEvent, setApplyEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.events(), api.bookmarks().catch(() => ({ events: [] }))])
      .then(([ev, bm]) => {
        setEvents(ev.events);
        setBookmarked(new Set(bm.events.map((e) => e.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q || e.title.toLowerCase().includes(q) || e.org.toLowerCase().includes(q) || e.skills.some((s) => s.toLowerCase().includes(q));
      const matchMode = mode === "All" || e.mode === mode.toLowerCase();
      const vMap: Record<string, string> = { QR: "qr", Geo: "geo", "Full Verify": "hybrid" };
      const matchV = verification === "All" || e.verification === vMap[verification];
      return matchSearch && matchMode && matchV;
    });
  }, [events, debouncedSearch, mode, verification]);

  const toggleBookmark = useCallback(async (id: string) => {
    const isSaved = bookmarked.has(id);
    if (isSaved) {
      await api.removeBookmark(id);
      setBookmarked((s) => { const n = new Set(s); n.delete(id); return n; });
    } else {
      await api.addBookmark(id);
      setBookmarked((s) => new Set(s).add(id));
    }
  }, [bookmarked]);

  const handleApply = useCallback(async (event: Event) => {
    setApplyEvent(event);
  }, []);

  if (loading) return <div className="h-96 rounded-2xl bg-white/[0.04] animate-pulse" />;

  return (
    <>
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Filters search={search} onSearch={setSearch} mode={mode} onMode={setMode} verification={verification} onVerification={setVerification} />
        </aside>
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onApply={() => handleApply(e)}
              bookmarked={bookmarked.has(e.id)}
              onBookmark={() => toggleBookmark(e.id)}
            />
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center py-16 text-ink-400">No events match your filters.</p>}
        </div>
      </div>
      <ApplyModal event={applyEvent} onClose={() => setApplyEvent(null)} onConfirm={applyEvent ? () => api.apply(applyEvent.id) : undefined} />
    </>
  );
}
