import { ArrowRight, Award, BarChart3, CheckCircle2, LockKeyhole, PlayCircle, Target, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { api } from '../lib/api';
import type { Bekal10Dashboard, ModuleStatus } from '../types/bekal10';

const statusMeta: Record<ModuleStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  completed: { label: 'Selesai', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700' },
  in_progress: { label: 'Sedang dikerjakan', icon: PlayCircle, className: 'bg-violet-50 text-violet-700' },
  not_started: { label: 'Belum dimulai', icon: PlayCircle, className: 'bg-blue-50 text-blue-700' },
  locked: { label: 'Terkunci', icon: LockKeyhole, className: 'bg-slate-100 text-slate-500' },
};

type LockedModule = { title: string; order: number };

export function Bekal10DashboardPage() {
  const [dashboard, setDashboard] = useState<Bekal10Dashboard | null>(null);
  const [error, setError] = useState('');
  const [lockedModule, setLockedModule] = useState<LockedModule | null>(null);

  useEffect(() => {
    api<Bekal10Dashboard>('/api/student/programs/bekal-10').then(setDashboard).catch((requestError: Error) => setError(requestError.message));
  }, []);

  const previousModuleSlug = useMemo(() => {
    if (!lockedModule || !dashboard) return null;
    return dashboard.program.modules.find((module) => module.order === lockedModule.order - 1)?.slug ?? null;
  }, [dashboard, lockedModule]);

  return (
    <StudentAppLayout eyebrow="Program siswa" title="Bekal 10">
      <div className="mx-auto max-w-6xl px-5 py-7 lg:px-7">
        <section className="rounded-lg bg-[#101b3f] p-6 text-white">
          <p className="text-sm text-[#ffe08a]">Kelas X - Perjalanan awal di SMA</p>
          <h1 className="mt-3 text-3xl font-semibold">Kenali Dirimu, Mulai Langkahmu, Wujudkan Versi Terbaik Dirimu</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Selesaikan tujuh tahap secara berurutan untuk membangun portofolio perkembangan awalmu.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link className="inline-flex items-center gap-2 rounded-lg bg-[#ffe08a] px-4 py-2.5 text-sm font-semibold text-[#101b3f]" to={dashboard?.program.currentModuleSlug ? `/app/programs/bekal-10/modules/${dashboard.program.currentModuleSlug}` : '/app/portfolio'}>
              Mulai Perjalanan <ArrowRight className="size-4" />
            </Link>
            <Link className="inline-flex items-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white" to="/app/programs/bekal-10/modules/mengenal-diriku-lebih-dekat">
              Kenali Potensimu
            </Link>
            <Link className="inline-flex items-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white" to="/app/programs/bekal-10/modules/target-pengembangan-diri">
              Target Pengembanganku
            </Link>
            <Link className="inline-flex items-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white" to="/app/profile">
              Dashboard Perkembangan
            </Link>
          </div>
          <div className="mt-7 max-w-xl">
            <div className="flex justify-between text-xs"><span>Progress program</span><span>{dashboard?.program.progressPercentage ?? 0}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#ffe08a]" style={{ width: `${dashboard?.program.progressPercentage ?? 0}%` }} />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: BarChart3, label: 'Total modul', value: dashboard?.program.totalModules ?? 7 },
            { icon: CheckCircle2, label: 'Modul selesai', value: dashboard?.program.completedCount ?? 0 },
            { icon: Target, label: 'Modul aktif', value: dashboard?.program.currentModuleSlug ? (dashboard.program.modules.find((module) => module.slug === dashboard.program.currentModuleSlug)?.order ?? '-') : '-' },
            { icon: Award, label: 'Badge diperoleh', value: dashboard?.program.completedCount ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4" key={label}>
              <Icon className="size-5 text-violet-700" />
              <p className="mt-3 text-2xl font-semibold text-[#101b3f]">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </article>
          ))}
        </section>

        {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="mt-7 space-y-3">
          {(dashboard?.program.modules ?? []).map((module) => {
            const meta = statusMeta[module.status];
            const Icon = meta.icon;
            const unlocked = module.status !== 'locked';
            return (
              <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[3rem_1fr_auto] md:items-center" key={module.id}>
                <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-[#101b3f]">{module.order}</span>
                <div>
                  <h2 className="font-semibold text-[#101b3f]">{module.title}</h2>
                  <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                    <Icon className="size-3.5" /> {meta.label}
                  </span>
                </div>
                {unlocked ? (
                  <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" to={`/app/programs/bekal-10/modules/${module.slug}`}>
                    {module.status === 'completed' ? 'Lihat kembali' : 'Buka modul'} <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50" onClick={() => setLockedModule({ title: module.title, order: module.order })} type="button">
                    <LockKeyhole className="size-4" /> Selesaikan tahap sebelumnya
                  </button>
                )}
              </article>
            );
          })}
        </section>
      </div>

      {lockedModule && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-5">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#101b3f]">Modul Masih Terkunci</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Selesaikan tahap sebelumnya terlebih dahulu untuk melanjutkan perjalananmu.</p>
              </div>
              <button className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" onClick={() => setLockedModule(null)} title="Tutup" type="button"><X className="size-4" /></button>
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">Modul {lockedModule.order}: {lockedModule.title}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" onClick={() => setLockedModule(null)} type="button">Kembali</button>
              <Link className="rounded-lg bg-[#101b3f] px-4 py-2.5 text-center text-sm font-semibold text-white" onClick={() => setLockedModule(null)} to={previousModuleSlug ? `/app/programs/bekal-10/modules/${previousModuleSlug}` : '/app/programs/bekal-10'}>Ke Modul Sebelumnya</Link>
            </div>
          </div>
        </div>
      )}
    </StudentAppLayout>
  );
}
