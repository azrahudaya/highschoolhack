import { ArrowRight, CheckCircle2, LockKeyhole, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export function Bekal10DashboardPage() {
  const [dashboard, setDashboard] = useState<Bekal10Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Bekal10Dashboard>('/api/student/programs/bekal-10').then(setDashboard).catch((requestError: Error) => setError(requestError.message));
  }, []);

  return (
    <StudentAppLayout eyebrow="Program siswa" title="Bekal 10">
      <div className="mx-auto max-w-6xl px-5 py-7 lg:px-7">
        <section className="rounded-lg bg-[#101b3f] p-6 text-white">
          <p className="text-sm text-[#ffe08a]">Kelas X · Perjalanan awal di SMA</p>
          <h1 className="mt-3 text-3xl font-semibold">Kenali dirimu, mulai langkahmu.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Selesaikan tujuh tahap secara berurutan untuk membangun portofolio perkembangan awalmu.</p>
          <div className="mt-7 max-w-xl"><div className="flex justify-between text-xs"><span>Progress program</span><span>{dashboard?.program.progressPercentage ?? 0}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#ffe08a]" style={{ width: `${dashboard?.program.progressPercentage ?? 0}%` }} /></div></div>
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
                <div><h2 className="font-semibold text-[#101b3f]">{module.title}</h2><span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}><Icon className="size-3.5" /> {meta.label}</span></div>
                {unlocked ? <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" to={`/app/programs/bekal-10/modules/${module.slug}`}>{module.status === 'completed' ? 'Lihat kembali' : 'Buka modul'} <ArrowRight className="size-4" /></Link> : <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-slate-400"><LockKeyhole className="size-4" /> Selesaikan tahap sebelumnya</span>}
              </article>
            );
          })}
        </section>
      </div>
    </StudentAppLayout>
  );
}
