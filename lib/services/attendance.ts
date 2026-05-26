import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getOrgEventIds(organizationId: string) {
  const events = await prisma.event.findMany({ where: { organizationId }, select: { id: true, title: true } });
  return events;
}

export async function generateEventQr(organizationId: string, eventId?: string) {
  const event = eventId
    ? await prisma.event.findFirst({ where: { id: eventId, organizationId } })
    : await prisma.event.findFirst({ where: { organizationId }, orderBy: { eventDate: "asc" } });

  if (!event) throw new Error("No event found for this organization");

  const attendance = await prisma.eventAttendance.upsert({
    where: { eventId: event.id },
    create: { eventId: event.id, qrToken: randomUUID() },
    update: { qrToken: randomUUID() },
  });

  return {
    eventId: event.id,
    eventTitle: event.title,
    qrToken: attendance.qrToken,
    checkInUrl: `/volunteer/check-in?token=${attendance.qrToken}`,
  };
}

export async function configureEventGeo(
  organizationId: string,
  input: { eventId: string; latitude: number; longitude: number; radiusMeters?: number }
) {
  const event = await prisma.event.findFirst({ where: { id: input.eventId, organizationId } });
  if (!event) throw new Error("Event not found");

  const attendance = await prisma.eventAttendance.upsert({
    where: { eventId: event.id },
    create: {
      eventId: event.id,
      geoLatitude: input.latitude,
      geoLongitude: input.longitude,
      geoRadiusMeters: input.radiusMeters ?? 100,
    },
    update: {
      geoLatitude: input.latitude,
      geoLongitude: input.longitude,
      geoRadiusMeters: input.radiusMeters ?? 100,
    },
  });

  return {
    eventId: event.id,
    eventTitle: event.title,
    latitude: attendance.geoLatitude,
    longitude: attendance.geoLongitude,
    radiusMeters: attendance.geoRadiusMeters,
  };
}

export async function listPendingAttendanceReviews(organizationId: string) {
  const apps = await prisma.application.findMany({
    where: {
      status: { in: ["REVIEWING", "PENDING", "SCREENING"] },
      event: { organizationId },
    },
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  return apps.map((a) => ({
    id: a.id,
    volunteer: a.user.name,
    event: a.event.title,
    status: a.status.toLowerCase(),
    trust: a.user.trustScore,
    appliedAt: a.createdAt.toISOString(),
  }));
}

export async function checkInWithQr(userId: string, qrToken: string) {
  const attendance = await prisma.eventAttendance.findUnique({
    where: { qrToken },
    include: { event: true },
  });
  if (!attendance) throw new Error("Invalid QR code");

  const application = await prisma.application.findUnique({
    where: { userId_eventId: { userId, eventId: attendance.eventId } },
  });
  if (!application || !["ACCEPTED", "APPROVED", "REVIEWING"].includes(application.status)) {
    throw new Error("You must be approved for this event before check-in");
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { userId_eventId: { userId, eventId: attendance.eventId } },
    create: { userId, eventId: attendance.eventId, method: "QR" },
    update: { method: "QR" },
    include: { event: { include: { organization: true } } },
  });

  return {
    eventTitle: record.event.title,
    org: record.event.organization.name,
    method: "QR",
    checkedInAt: record.createdAt.toISOString(),
  };
}

export async function checkInWithGeo(userId: string, eventId: string, latitude: number, longitude: number) {
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId },
    include: { event: { include: { organization: true } } },
  });
  if (!attendance?.geoLatitude || attendance.geoLongitude == null) {
    throw new Error("Geo zone not configured for this event");
  }

  const distance = haversineMeters(latitude, longitude, attendance.geoLatitude, attendance.geoLongitude);
  if (distance > attendance.geoRadiusMeters) {
    throw new Error(`Outside geofence (${Math.round(distance)}m away, max ${attendance.geoRadiusMeters}m)`);
  }

  const application = await prisma.application.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!application || !["ACCEPTED", "APPROVED", "REVIEWING"].includes(application.status)) {
    throw new Error("You must be approved for this event before check-in");
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, method: "GEO", latitude, longitude },
    update: { method: "GEO", latitude, longitude },
    include: { event: { include: { organization: true } } },
  });

  return {
    eventTitle: record.event.title,
    org: record.event.organization.name,
    method: "GEO",
    distanceMeters: Math.round(distance),
    checkedInAt: record.createdAt.toISOString(),
  };
}
