import type { User, Organization } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/types";
import { prismaRoleToApp } from "./role";

type UserWithOrg = User & { organization: Organization | null };

export function toSessionUser(user: UserWithOrg): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: prismaRoleToApp(user.role),
    organizationId: user.organization?.id ?? null,
    trustScore: user.trustScore,
  };
}
