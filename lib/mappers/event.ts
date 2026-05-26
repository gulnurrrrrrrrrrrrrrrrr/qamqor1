import type { Event, Organization, Application } from "@prisma/client";
import type { Event as AppEvent, EventMode, VerificationType } from "@/lib/types";

type EventWithOrg = Event & {
  organization: Organization;
  applications?: Application[];
};

function toMode(mode: string): EventMode {
  return mode.toLowerCase() as EventMode;
}

function toVerification(v: string): VerificationType {
  const map: Record<string, VerificationType> = {
    QR: "qr",
    GEO: "geo",
    HYBRID: "hybrid",
    MANUAL: "manual",
  };
  return map[v] ?? "manual";
}

export function toAppEvent(event: EventWithOrg): AppEvent {
  const participants =
    event.applications?.filter((a) => a.status === "ACCEPTED" || a.status === "APPROVED").length ?? 0;

  return {
    id: event.id,
    title: event.title,
    org: event.organization.name,
    orgLogo: event.organization.logo,
    location: event.location,
    mode: toMode(event.mode),
    skills: event.skills,
    participants,
    maxParticipants: event.maxParticipants,
    verification: toVerification(event.verification),
    trustRequired: event.trustRequired,
    date: formatEventDate(event.eventDate),
    hours: event.hours,
    featured: event.featured,
  };
}

function formatEventDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
