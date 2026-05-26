import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.adminAction.create({
      data: {
        adminId,
        action,
        targetType,
        targetId: targetId ?? null,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[AdminAudit] Failed to log action", action, err);
  }
}

export async function listAdminActions(limit = 50) {
  return prisma.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { admin: { select: { id: true, name: true, email: true } } },
  });
}
