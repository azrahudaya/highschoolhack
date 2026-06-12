import { AlertTriangle, CheckCircle2, ChevronRight, Gauge, Search, UsersRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TeacherAppLayout } from '../components/TeacherAppLayout';
import { api } from '../lib/api';
import type { TeacherBekal10Dashboard } from '../types/bekal10';

function Distribution({ data, title }: { data: Record<string, number>; title: string }) {
  const items = Object.entries(data).sort(([, left], [, right]) => right - left).slice(0, 5);
  const max = Math.max(...items.map(([, value]) => value), 1);
  return <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-[#101b3f]">{title}</h2><div className="mt-4 space-y-3">{items.length ? items.map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-600">{label}</span><span className="font-semibold text-slate-500">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.round((value / max) * 100)}%` }} /></div></div>) : <p className="text-sm text-slate-400">Belum ada data.</p>}</div></section>;
}

export function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState<TeacherBekal10Dashboard | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (appliedSearch) params.set('search', appliedSearch);
    if (classId) params.set('classId', classId);
    api<TeacherBekal10Dashboard>(`/api/teacher/bekal-10/dashboard?${params}`).then(setDashboard).catch((requestError: Error) => setError(requestError.message));
  }, [appliedSearch, classId]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  const metrics = [
    { icon: UsersRound, label: 'Total siswa', value: dashboard?.metrics.totalStudents ?? 0, tone: 'text-blue-700 bg-blue-50' },
    { icon: Gauge, label: 'Rata-rata progress', value: `${dashboard?.metrics.averageProgress ?? 0}%`, tone: 'text-violet-700 bg-violet-50' },
    { icon: CheckCircle2, label: 'Program selesai', value: dashboard?.metrics.completedStudents ?? 0, tone: 'text-emerald-700 bg-emerald-50' },
    { icon: AlertTriangle, label: 'Perlu perhatian', value: dashboard?.metrics.needsAttention ?? 0, tone: 'text-amber-700 bg-amber-50' },
  ];

  return <TeacherAppLayout>
    <div className="mx-auto max-w-7xl px-5 py-7 lg:px-7">
      <div><p className="text-sm font-semibold text-violet-700">Bekal 10</p><h1 className="mt-1 text-2xl font-semibold text-[#101b3f]">Monitoring perkembangan siswa</h1><p className="mt-2 text-sm text-slate-500">{dashboard?.school.name ?? 'Memuat sekolah...'}</p></div>
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ icon: Icon, label, tone, value }) => <article className="rounded-lg border border-slate-200 bg-white p-5" key={label}><div className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></div><p className="mt-4 text-2xl font-semibold text-[#101b3f]">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></article>)}</section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Distribution data={dashboard?.distributions.riasec ?? {}} title="Distribusi minat RIASEC" /><Distribution data={dashboard?.distributions.vark ?? {}} title="Distribusi preferensi belajar" /><Distribution data={dashboard?.distributions.adaptationChallenges ?? {}} title="Tantangan adaptasi terbanyak" /><Distribution data={dashboard?.distributions.developmentAreas ?? {}} title="Area pengembangan terpopuler" /><Distribution data={dashboard?.distributions.difficultSubjects ?? {}} title="Mata pelajaran sulit" /></section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="font-semibold text-[#101b3f]">Daftar siswa</h2><p className="mt-1 text-xs text-slate-500">{dashboard?.students.length ?? 0} siswa sesuai filter</p></div><div className="flex flex-col gap-2 sm:flex-row"><form className="flex min-w-0" onSubmit={submitSearch}><input aria-label="Cari siswa" className="h-10 min-w-0 rounded-l-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 sm:w-64" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau NISN" value={search} /><button className="grid size-10 shrink-0 place-items-center rounded-r-lg bg-[#101b3f] text-white" title="Cari" type="submit"><Search className="size-4" /></button></form><select aria-label="Filter kelas" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500" onChange={(event) => setClassId(event.target.value)} value={classId}><option value="">Semua kelas</option>{dashboard?.school.classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">Nama</th><th className="px-5 py-3 font-semibold">Kelas</th><th className="px-5 py-3 font-semibold">NISN</th><th className="px-5 py-3 font-semibold">Progress</th><th className="px-5 py-3 font-semibold">Status</th><th className="w-12 px-5 py-3"><span className="sr-only">Detail</span></th></tr></thead><tbody className="divide-y divide-slate-200">{dashboard?.students.map((student) => <tr className="hover:bg-slate-50" key={student.userId}><td className="px-5 py-4 font-semibold text-[#101b3f]">{student.name}</td><td className="px-5 py-4 text-slate-500">{student.className ?? '-'}</td><td className="px-5 py-4 text-slate-500">{student.nisn ?? '-'}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${student.progressPercentage}%` }} /></div><span className="text-xs font-semibold text-slate-500">{student.progressPercentage}%</span></div></td><td className="px-5 py-4">{student.needsAttention ? <span className="text-xs font-semibold text-amber-700">Perlu perhatian</span> : <span className="text-xs font-semibold text-emerald-700">Berjalan baik</span>}</td><td className="px-5 py-4"><Link className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-700" title={`Lihat ${student.name}`} to={`/teacher/students/${student.userId}`}><ChevronRight className="size-4" /></Link></td></tr>)}</tbody></table></div>
      </section>
    </div>
  </TeacherAppLayout>;
}
