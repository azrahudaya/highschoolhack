import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { api } from '../lib/api';

type VerifyResponse = {
  message: string;
};

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'Token verifikasi email tidak tersedia.');
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api<VerifyResponse>('/api/auth/email-verification/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then((response) => setMessage(response.message))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AuthShell title="Verifikasi email" subtitle="Kami mengecek token verifikasi email akun HighschoolHack kamu.">
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="size-7 animate-spin text-violet-600" />
            <p className="text-sm text-slate-600">Memverifikasi email...</p>
          </div>
        )}
        {!loading && message && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="size-8 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">{message}</p>
          </div>
        )}
        {!loading && error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link className="font-semibold text-[#5b21b6]" to="/login">Kembali ke login</Link>
      </p>
    </AuthShell>
  );
}
