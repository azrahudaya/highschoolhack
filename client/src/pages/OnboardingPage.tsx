import { Search, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

type SchoolLookup = {
  schools: Array<{
    id: string;
    name: string;
    slug: string;
    classes: Array<{ id: string; name: string; grade: number }>;
  }>;
};

export function OnboardingPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schools, setSchools] = useState<SchoolLookup['schools']>([]);
  const [school, setSchool] = useState<SchoolLookup['schools'][number] | null>(null);
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [classId, setClassId] = useState('');
  const [nisn, setNisn] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function lookupSchool() {
    setError('');
    setSchool(null);
    setClassId('');
    const query = schoolQuery.trim();

    if (query.length < 2) {
      setSchools([]);
      setError('Masukkan minimal 2 karakter nama sekolah.');
      return;
    }

    try {
      const params = new URLSearchParams({ query });
      const result = await api<SchoolLookup>(`/api/schools/lookup?${params}`);
      setSchools(result.schools);
      if (!result.schools.length) setError('Sekolah tidak ditemukan. Pastikan nama sekolah sudah terdaftar.');
    } catch (requestError) {
      setSchools([]);
      setSchool(null);
      setError(requestError instanceof Error ? requestError.message : 'Sekolah tidak ditemukan.');
    }
  }

  function selectSchool(nextSchool: SchoolLookup['schools'][number]) {
    setSchool(nextSchool);
    setSchoolQuery(nextSchool.name);
    setSchools([]);
    setClassId(nextSchool.classes[0]?.id ?? '');
    setError('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!school) {
      setError('Pilih sekolah terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api('/api/onboarding/student', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          schoolId: school.id,
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
    <AuthShell title="Hubungkan akun ke sekolah" subtitle="Ketik nama sekolahmu lalu pilih kelas yang tersedia.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Nama sekolah
          <div className="mt-2 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#5b21b6]"
              onChange={(event) => {
                setSchoolQuery(event.target.value);
                setSchool(null);
                setClassId('');
              }}
              placeholder="Contoh: SMA Nusantara"
              required
              value={schoolQuery}
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

        {schools.length > 0 && !school && (
          <div className="rounded-lg border border-slate-200 bg-white p-2">
            {schools.map((item) => (
              <button
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left hover:bg-slate-50"
                key={item.id}
                onClick={() => selectSchool(item)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-800">{item.name}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.classes.length} kelas tersedia</span>
                </span>
                <span className="shrink-0 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Pilih</span>
              </button>
            ))}
          </div>
        )}

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
            disabled={!school || school.classes.length === 0}
            onChange={(event) => setClassId(event.target.value)}
            value={classId}
          >
            {!school && <option value="">Pilih sekolah terlebih dahulu</option>}
            {school && school.classes.length === 0 && <option value="">Kelas belum tersedia</option>}
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
