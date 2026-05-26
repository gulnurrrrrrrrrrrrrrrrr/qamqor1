import type { Role as PrismaRole } from "@prisma/client";
import type { Role } from "@/lib/auth/types";

export function prismaRoleToApp(role: PrismaRole): Role {
  return role.toLowerCase() as Role;
}

export function appRoleToPrisma(role: Role): PrismaRole {
  return role.toUpperCase() as PrismaRole;
}
