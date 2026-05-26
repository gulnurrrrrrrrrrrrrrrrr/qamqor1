import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Event } from "@/lib/types";
import { EventPreviewCards } from "./EventPreviewCards";

export function EventPreview({ events }: { events: Event[] }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-400 mb-2">Curated Opportunities</p>
            <h2 className="text-3xl font-medium text-white">Events worth your time</h2>
          </div>
          <Link href="/onboarding" className="hidden sm:flex items-center gap-1 text-sm text-accent-light hover:text-white transition">
            View all <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <EventPreviewCards items={events} />
      </div>
    </section>
  );
}
