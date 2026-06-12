import { UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { getUserHomePath, useAuth, type AuthUser } from '../contexts/AuthContext';
import { api } from '../lib/api';

type RegisterResponse = {
  user: AuthUser;
  redirectTo: string;
};

export function RegisterPage() {
  const { user, loading, googleAuthConfigured, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={getUserHomePath(user)} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      await refresh();
      navigate(response.redirectTo);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registrasi gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Buat akun HighschoolHack" subtitle="Setelah daftar, hubungkan akunmu ke sekolah menggunakan kode sekolah.">
      {googleAuthConfigured && (
        <a
          className="mb-5 flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400"
          href="/api/auth/google"
        >
          Daftar dengan Google
        </a>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Nama lengkap
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
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
          Password minimal 8 karakter
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
          <UserPlus className="size-4" aria-hidden="true" />
          {submitting ? 'Membuat akun...' : 'Daftar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{' '}
        <Link className="font-semibold text-[#5b21b6]" to="/login">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
