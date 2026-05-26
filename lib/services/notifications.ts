import { prisma } from "@/lib/prisma";

export async function listNotifications(userId: string) {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    time: formatRelative(n.createdAt),
    read: n.read,
  }));
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours || 1}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
