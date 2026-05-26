import { prisma } from "@/lib/prisma";
import { toAppEvent } from "@/lib/mappers/event";

export async function listBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          organization: true,
          applications: { where: { status: { in: ["ACCEPTED", "APPROVED"] } } },
        },
      },
    },
  });
  return bookmarks.map((b) => toAppEvent(b.event));
}

export async function addBookmark(userId: string, eventId: string) {
  await prisma.bookmark.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId },
    update: {},
  });
}

export async function removeBookmark(userId: string, eventId: string) {
  await prisma.bookmark.deleteMany({ where: { userId, eventId } });
}

export async function getBookmarkIds(userId: string) {
  const rows = await prisma.bookmark.findMany({ where: { userId }, select: { eventId: true } });
  return new Set(rows.map((r) => r.eventId));
}
