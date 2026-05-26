"use client";

import { memo, useCallback } from "react";
import { MapPin, Users, Shield, Wifi, Building2, Bookmark } from "lucide-react";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const modeIcon = { online: Wifi, offline: Building2, hybrid: MapPin };
const verifyLabel = { qr: "QR Verified", geo: "Geo Verified", hybrid: "Full Verify", manual: "Manual" };

interface EventCardProps {
  event: Event;
  onApply?: (id: string) => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
  compact?: boolean;
}

export const EventCard = memo(function EventCard({ event, onApply, onBookmark, bookmarked, compact }: EventCardProps) {
  const ModeIcon = modeIcon[event.mode];
  const pct = Math.round((event.participants / event.maxParticipants) * 100);
  const handleApply = useCallback(() => onApply?.(event.id), [onApply, event.id]);

  return (
    <article className={cn("group relative overflow-hidden rounded-2xl glass-raised transition duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-accent/5", event.featured && "glow-ring")}>
      <div className="absolute inset-0 bg-card-shine pointer-events-none" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-semibold text-accent-light">{event.orgLogo}</div>
            <div>
              <p className="text-xs text-ink-300">{event.org}</p>
              <h3 className={cn("font-medium text-white leading-snug", compact ? "text-sm" : "text-base")}>{event.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onBookmark && (
              <button type="button" onClick={onBookmark} className={cn("rounded-lg p-1.5 transition", bookmarked ? "text-gold" : "text-ink-500 hover:text-white")} aria-label="Bookmark">
                <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
              </button>
            )}
            {event.featured && <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">Featured</span>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.skills.map((s) => (
            <span key={s} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-ink-200">{s}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-300 sm:grid-cols-4">
          <span className="flex items-center gap-1"><ModeIcon size={12} className="text-ink-400" aria-hidden />{event.mode}</span>
          <span className="flex items-center gap-1"><MapPin size={12} className="text-ink-400" aria-hidden />{event.location}</span>
          <span className="flex items-center gap-1"><Users size={12} className="text-ink-400" aria-hidden />{event.participants}/{event.maxParticipants}</span>
          <span className="flex items-center gap-1"><Shield size={12} className="text-accent-light" aria-hidden />{verifyLabel[event.verification]}</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-accent/60 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-ink-400">
            <span className="text-ink-200">{event.date}</span> · {event.hours}h · Trust {event.trustRequired}+
          </div>
          <Button variant="secondary" size="sm" onClick={handleApply}>Quick Apply</Button>
        </div>
      </div>
    </article>
  );
});
