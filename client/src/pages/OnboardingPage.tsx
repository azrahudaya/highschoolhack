import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function OnboardingPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [nisn, setNisn] = useState('');
  const [error, setError] = useState('');
  const [nisnError, setNisnError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalizedNisn = nisn.trim();
    if (normalizedNisn && !/^\d{10}$/.test(normalizedNisn)) {
      setNisnError('NISN biasanya terdiri dari 10 digit angka. Kosongkan jika belum tahu.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNisnError('');

    try {
      await api('/api/onboarding/student', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          schoolName: schoolName.trim(),
          className: className.trim(),
          nisn: normalizedNisn || undefined,
        }),
      });
      await refresh();
      navigate('/app');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Onboarding gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Hubungkan akun ke sekolah" subtitle="Isi data sekolah dan kelas seperti data profil biasa.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Nama lengkap
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Nama sekolah
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setSchoolName(event.target.value)}
            placeholder="Contoh: SMA Negeri 1 Bandung"
            required
            value={schoolName}
          />
          <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Gunakan nama resmi sekolah jika tahu.</span>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Kelas
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setClassName(event.target.value)}
            placeholder="Contoh: X-1"
            required
            value={className}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          NISN (opsional)
          <input
            className={`mt-2 w-full rounded-lg border bg-white px-3 py-3 outline-none focus:border-[#5b21b6] ${nisnError ? 'border-red-300' : 'border-slate-300'}`}
            inputMode="numeric"
            maxLength={10}
            onChange={(event) => {
              setNisn(event.target.value.replace(/\D/g, ''));
              setNisnError('');
            }}
            placeholder="Contoh: 0012345678"
            value={nisn}
          />
          {nisnError && <span className="mt-1 block text-xs font-normal leading-5 text-red-600">{nisnError}</span>}
        </label>
        {error && <p aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          className="w-full rounded-lg bg-[#15224a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#22346a] disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Menyimpan...' : 'Masuk ke Bekal 10'}
        </button>
      </form>
    </AuthShell>
  );
}
