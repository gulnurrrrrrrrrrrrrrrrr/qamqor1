import type { EventMode, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toAppEvent } from "@/lib/mappers/event";

export interface EventFilters {
  search?: string;
  mode?: string;
  verification?: string;
  featured?: boolean;
  organizationId?: string;
}

export async function listEvents(filters: EventFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.featured) where.featured = true;
  if (filters.organizationId) where.organizationId = filters.organizationId;

  if (filters.mode && filters.mode !== "All") {
    where.mode = filters.mode.toUpperCase();
  }

  if (filters.verification && filters.verification !== "All") {
    const vMap: Record<string, VerificationType> = {
      QR: "QR",
      Geo: "GEO",
      "Full Verify": "HYBRID",
    };
    if (vMap[filters.verification]) where.verification = vMap[filters.verification];
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      organization: true,
      applications: { where: { status: { in: ["ACCEPTED", "APPROVED"] } } },
    },
    orderBy: { eventDate: "asc" },
  });

  let mapped = events.map(toAppEvent);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    mapped = mapped.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.org.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return mapped;
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organization: true,
      applications: true,
    },
  });
  if (!event) return null;
  return toAppEvent(event);
}

export interface CreateEventInput {
  organizationId: string;
  title: string;
  description?: string | null;
  location: string;
  mode: EventMode;
  verification: VerificationType;
  trustRequired: number;
  eventDate: Date;
  hours: number;
  maxParticipants: number;
  featured?: boolean;
  skills: string[];
}

export async function createEvent(data: CreateEventInput) {
  const event = await prisma.event.create({
    data,
    include: { organization: true, applications: true },
  });
  return toAppEvent(event);
}

export async function updateEvent(id: string, data: Partial<CreateEventInput>) {
  const event = await prisma.event.update({
    where: { id },
    data,
    include: { organization: true, applications: true },
  });
  return toAppEvent(event);
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
}
