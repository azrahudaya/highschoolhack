import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserHomePath, useAuth, type UserRole } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: UserRole[];
  allowWithoutMembership?: boolean;
};

export function ProtectedRoute({ children, roles, allowWithoutMembership = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f8fbff] text-sm text-slate-500">Memuat sesi...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowWithoutMembership && user.memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles && !user.memberships.some((membership) => roles.includes(membership.role))) {
    return <Navigate to={getUserHomePath(user)} replace />;
  }

  return children;
}
