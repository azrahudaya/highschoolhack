import type { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { AuthUser } from './types';

export async function getAuthUser(userId: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerifiedAt: true,
      memberships: {
        select: {
          id: true,
          role: true,
          school: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export function hasRole(user: AuthUser, roles: UserRole[]) {
  return user.memberships.some((membership) => roles.includes(membership.role));
}

export function getDefaultAppPath(user: AuthUser) {
  const roles = user.memberships.map((membership) => membership.role);

  if (roles.includes('super_admin') || roles.includes('school_admin')) return '/admin';
  if (roles.includes('teacher_bk')) return '/teacher';
  if (roles.includes('student')) return '/app';

  return '/onboarding';
}
