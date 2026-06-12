import type { UserRole } from '@prisma/client';

export type AuthMembership = {
  id: string;
  role: UserRole;
  school: {
    id: string;
    name: string;
    slug: string;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  memberships: AuthMembership[];
};
