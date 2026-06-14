import { KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { api } from '../lib/api';

type ResetResponse = {
  message: string;
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'Token reset password tidak tersedia.');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await api<ResetResponse>('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setMessage(response.message);
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Reset password gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Buat password baru" subtitle="Gunakan password baru minimal 8 karakter.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Password baru
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            disabled={!token || Boolean(message)}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Konfirmasi password
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            disabled={!token || Boolean(message)}
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>
        {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#15224a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#22346a] disabled:opacity-60"
          disabled={submitting || !token || Boolean(message)}
          type="submit"
        >
          <KeyRound className="size-4" aria-hidden="true" />
          {submitting ? 'Menyimpan...' : 'Simpan password baru'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link className="font-semibold text-[#5b21b6]" to="/login">Kembali ke login</Link>
      </p>
    </AuthShell>
  );
}
