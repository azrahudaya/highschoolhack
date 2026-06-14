import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

export type UserRole = 'student' | 'teacher_bk' | 'school_admin' | 'super_admin';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerifiedAt: string | null;
  memberships: Array<{
    id: string;
    role: UserRole;
    school: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

export function getUserHomePath(user: AuthUser) {
  const roles = user.memberships.map((membership) => membership.role);

  if (roles.includes('super_admin') || roles.includes('school_admin')) return '/admin';
  if (roles.includes('teacher_bk')) return '/teacher';
  if (roles.includes('student')) return '/app';

  return '/onboarding';
}

type AuthResponse = {
  user: AuthUser | null;
  authenticated: boolean;
  googleAuthConfigured: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  googleAuthConfigured: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAuthConfigured, setGoogleAuthConfigured] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await api<AuthResponse>('/api/auth/me');
      setUser(response.user);
      setGoogleAuthConfigured(response.googleAuthConfigured);
      return response.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api<void>('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, googleAuthConfigured, refresh, logout }),
    [user, loading, googleAuthConfigured, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
