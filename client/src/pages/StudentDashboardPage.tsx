import { ArrowRight, CalendarCheck2, FileText, Target, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { consumePostOnboardingNext } from '../lib/navigation';
import type { Bekal10Dashboard } from '../types/bekal10';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Bekal10Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const next = consumePostOnboardingNext();
    if (next && next !== '/app') {
      navigate(next, { replace: true });
      return;
    }
    api<Bekal10Dashboard>('/api/student/programs/bekal-10').then(setDashboard).catch((requestError: Error) => setError(requestError.message));
  }, [navigate]);

  const current = dashboard?.program.modules.find((module) => module.slug === dashboard.program.currentModuleSlug);

  return (
    <StudentAppLayout>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-7">
        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <section className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-lg bg-[#101b3f] p-6 text-white">
            <p className="text-sm text-white/55">Halo, {dashboard?.student.name ?? user?.name ?? 'Siswa'}! Selamat datang kembali di perjalanan awalmu di SMA.</p>
            <h1 className="mt-2 text-2xl font-semibold">Lanjutkan perjalanan Bekal 10-mu.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{current ? `Tahap berikutnya: ${current.title}.` : 'Semua tahap Bekal 10 telah selesai.'}</p>
            <div className="mt-7">
              <div className="flex justify-between text-xs"><span>Progress keseluruhan</span><span>{dashboard?.program.progressPercentage ?? 0}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#ffe08a]" style={{ width: `${dashboard?.program.progressPercentage ?? 0}%` }} /></div>
            </div>
            {current && <Link className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#ffe08a] px-4 py-2.5 text-sm font-semibold text-[#101b3f]" to={`/app/programs/bekal-10/modules/${current.slug}`}>Lanjutkan modul <ArrowRight className="size-4" /></Link>}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#101b3f]">Progress program</p><CalendarCheck2 className="size-5 text-[#5b21b6]" /></div>
            <p className="mt-5 text-3xl font-semibold text-[#101b3f]">{dashboard?.program.completedCount ?? 0}/{dashboard?.program.totalModules ?? 7}</p>
            <p className="mt-1 text-sm text-slate-500">Modul selesai</p>
            <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-sm font-medium text-slate-700">{dashboard?.student.className ?? 'Kelas belum dipilih'}</p><p className="mt-1 text-xs text-slate-400">{dashboard?.student.schoolName ?? 'Sekolah'}</p></div>
          </div>
        </section>

        <section className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-[#101b3f]">Perjalanan Bekal 10</h2><p className="mt-1 text-xs text-slate-500">Modul terbuka secara berurutan</p></div><Link className="text-sm font-semibold text-[#5b21b6]" to="/app/programs/bekal-10">Buka program</Link></div>
            <div className="divide-y divide-slate-200">
              {(dashboard?.program.modules ?? []).map((module) => (
                <Link className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-4 ${module.status === 'locked' ? 'pointer-events-none opacity-55' : 'hover:bg-slate-50'}`} key={module.id} to={`/app/programs/bekal-10/modules/${module.slug}`}>
                  <span className={`grid size-8 place-items-center rounded-md text-sm font-semibold ${module.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : module.status === 'in_progress' ? 'bg-[#ede9fe] text-[#5b21b6]' : 'bg-slate-100 text-slate-500'}`}>{module.order}</span>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#101b3f]">{module.title}</span><span className="mt-1 block text-xs capitalize text-slate-400">{module.status.replace('_', ' ')}</span></span>
                  <ArrowRight className="size-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-[#101b3f]">Portofolio saya</h2><p className="mt-2 text-sm leading-6 text-slate-500">Setiap modul selesai akan menambahkan bagian baru ke portofolio.</p><div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-semibold text-[#101b3f]">{dashboard?.program.completedCount ?? 0}</p><p className="text-xs text-slate-400">bagian terisi</p></div><FileText className="size-8 text-[#5b21b6]" /></div><Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700" to="/app/portfolio">Buka portofolio <ArrowRight className="size-4" /></Link></div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3"><Target className="size-5 text-emerald-700" /><h2 className="font-semibold text-[#101b3f]">Setting Goal</h2><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Kelas XI</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-500">Program kelas XI untuk eksplorasi jurusan, karier, dan rencana aksi.</p>
              <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" to="/app/programs/setting-goal">Buka program <ArrowRight className="size-4" /></Link>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3"><WalletCards className="size-5 text-[#b45309]" /><h2 className="font-semibold text-[#101b3f]">Smart Financial</h2><span className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Kelas XII</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-500">Program kelas XII untuk simulasi biaya hidup, beasiswa, dan kesiapan finansial setelah lulus.</p>
              <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700" to="/app/programs/smart-financial">Buka program <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </section>
      </div>
    </StudentAppLayout>
  );
}
