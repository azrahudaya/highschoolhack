import { LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { getUserHomePath, useAuth, type AuthUser } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { safeNextPath, storePostOnboardingNext } from '../lib/navigation';

type LoginResponse = {
  user: AuthUser;
  redirectTo: string;
};

export function LoginPage() {
  const { user, loading, googleAuthConfigured, refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={nextPath && user.memberships.length ? nextPath : getUserHomePath(user)} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      if (nextPath && response.user.memberships.length) navigate(nextPath);
      else navigate(response.redirectTo);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Masuk ke akunmu" subtitle="Lanjutkan progres dan perjalanan HighschoolHack dari perangkat mana pun.">
      {googleAuthConfigured ? (
        <a
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400"
          href="/api/auth/google"
          onClick={() => storePostOnboardingNext(nextPath)}
        >
          Masuk dengan Google
        </a>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Google OAuth belum dikonfigurasi. Login email tetap tersedia setelah database tersambung.
        </div>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        atau email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#15224a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#22346a] disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          <LogIn className="size-4" aria-hidden="true" />
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{' '}
        <Link className="font-semibold text-[#5b21b6]" to={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : '/register'}>
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
}
