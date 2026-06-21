import { Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { api } from '../lib/api';

type PasswordResetRequestResponse = {
  message: string;
  devToken?: string;
};

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    setDevToken('');

    try {
      const response = await api<PasswordResetRequestResponse>('/api/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
      setDevToken(response.devToken ?? '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Permintaan reset password gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Masukkan email akun. Jika terdaftar, kami kirim instruksi reset atau pembuatan password pertama.">
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
        {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {devToken && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Dev token: {devToken}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#15224a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#22346a] disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          <Mail className="size-4" aria-hidden="true" />
          {submitting ? 'Mengirim...' : 'Kirim instruksi reset'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Ingat password? <Link className="font-semibold text-[#5b21b6]" to="/login">Masuk</Link>
      </p>
    </AuthShell>
  );
}
