import { Search, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

type SchoolLookup = {
  school: {
    id: string;
    name: string;
    slug: string;
    classes: Array<{ id: string; name: string; grade: number }>;
  };
};

export function OnboardingPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [school, setSchool] = useState<SchoolLookup['school'] | null>(null);
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [classId, setClassId] = useState('');
  const [nisn, setNisn] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function lookupSchool() {
    setError('');
    try {
      const result = await api<SchoolLookup>(`/api/schools/join/${encodeURIComponent(joinCode)}`);
      setSchool(result.school);
      setClassId(result.school.classes[0]?.id ?? '');
    } catch (requestError) {
      setSchool(null);
      setError(requestError instanceof Error ? requestError.message : 'Sekolah tidak ditemukan.');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api('/api/onboarding/student', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          schoolJoinCode: joinCode,
          classId: classId || undefined,
          nisn: nisn || undefined,
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
    <AuthShell title="Hubungkan akun ke sekolah" subtitle="Masukkan kode sekolah dari Guru BK atau admin sekolahmu.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Kode sekolah
          <div className="mt-2 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 uppercase outline-none focus:border-[#5b21b6]"
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              required
              value={joinCode}
            />
            <button
              className="grid size-12 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              onClick={lookupSchool}
              title="Cari sekolah"
              type="button"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </div>
        </label>

        {school && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <School className="size-5 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-950">{school.name}</p>
              <p className="text-sm text-emerald-700">{school.classes.length} kelas tersedia</p>
            </div>
          </div>
        )}

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
          Kelas
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            disabled={!school}
            onChange={(event) => setClassId(event.target.value)}
            value={classId}
          >
            {!school && <option value="">Cari sekolah terlebih dahulu</option>}
            {school?.classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          NISN
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
            onChange={(event) => setNisn(event.target.value)}
            value={nisn}
          />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          className="w-full rounded-lg bg-[#15224a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#22346a] disabled:opacity-60"
          disabled={!school || submitting}
          type="submit"
        >
          {submitting ? 'Menyimpan...' : 'Selesaikan Onboarding'}
        </button>
      </form>
    </AuthShell>
  );
}
