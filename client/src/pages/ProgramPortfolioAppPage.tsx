import { ArrowLeft, Award, CheckCircle2, CircleDashed, Download, LoaderCircle, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { workflows } from '../data/program-workflows';
import { api } from '../lib/api';
import type { ModuleStatus } from '../types/bekal10';

type ProgramPortfolio = {
  student: { name: string; nisn: string | null; className: string | null; schoolName: string };
  program: { title: string; completedCount: number; totalModules: number };
  modules: Array<{ id: string; slug: string; title: string; order: number; status: ModuleStatus; data: Record<string, unknown> | null }>;
};

function valueText(value: unknown) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return '';
}

const programBadges: Record<string, string[]> = {
  'setting-goal': ['Pengenal Arah', 'Penjelajah Studi', 'Penjelajah Karier', 'Gap Analyst', 'SMART Planner', 'Action Builder', 'Progress Keeper', 'Reflective Decision'],
  'smart-financial': ['Money Mapper', 'City Planner', 'Risk Simulator', 'Readiness Builder'],
};

export function ProgramPortfolioAppPage() {
  const { programSlug = '' } = useParams();
  const workflow = workflows[programSlug as keyof typeof workflows];
  const [portfolio, setPortfolio] = useState<ProgramPortfolio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workflow) return;
    api<ProgramPortfolio>(`/api/student/programs/${workflow.programSlug}/portfolio`).then(setPortfolio).catch((requestError: Error) => setError(requestError.message));
  }, [workflow]);

  if (!workflow) return <Navigate to="/app" replace />;

  return (
    <StudentAppLayout eyebrow={workflow.title} title="Ringkasan program">
      <div className="no-print mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 lg:px-7">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to={`/app/programs/${workflow.programSlug}`}><ArrowLeft className="size-4" /> Kembali</Link>
        <div className="flex flex-wrap justify-end gap-2">
          <a className={`inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 ${!portfolio ? 'pointer-events-none opacity-50' : ''}`} href={`/api/student/programs/${workflow.programSlug}/portfolio.pdf`}><Download className="size-4" />Unduh PDF</a>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" disabled={!portfolio} onClick={() => window.print()} type="button"><Printer className="size-4" />Cetak / Simpan PDF</button>
        </div>
      </div>
      {error && <p className="mx-auto max-w-5xl rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!portfolio && !error && <div className="grid min-h-80 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}
      {portfolio && <article className="portfolio-document mx-auto max-w-5xl bg-white p-5 md:p-8">
        <header className="border-b-2 border-[#101b3f] pb-6">
          <p className="text-xs font-semibold uppercase" style={{ color: workflow.accent }}>{workflow.title}</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#101b3f]">{portfolio.student.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{portfolio.student.schoolName} - {portfolio.student.className ?? 'Kelas belum tersedia'} - NISN {portfolio.student.nisn ?? '-'}</p>
          <div className="mt-5 rounded-lg bg-[#101b3f] p-4 text-white"><p className="text-xs text-white/60">Progress</p><p className="mt-1 text-2xl font-semibold">{portfolio.program.completedCount}/{portfolio.program.totalModules} modul selesai</p></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {portfolio.modules.map((module, index) => {
              const earned = module.status === 'completed';
              return <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${earned ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-50 text-slate-400'}`} key={module.id}><Award className="size-4" />{programBadges[workflow.programSlug]?.[index] ?? module.title}</div>;
            })}
          </div>
        </header>
        <div className="mt-7 space-y-5">
          {portfolio.modules.map((module) => (
            <section className="portfolio-section rounded-lg border border-slate-200 p-5" key={module.id}>
              <div className="flex items-center gap-3">
                <span className={`grid size-8 place-items-center rounded text-sm font-semibold ${module.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{module.status === 'completed' ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}</span>
                <div><p className="text-xs text-slate-400">Modul {module.order}</p><h2 className="font-semibold text-[#101b3f]">{module.title}</h2></div>
              </div>
              {module.data ? <div className="mt-5 grid gap-4 md:grid-cols-2">{Object.entries(module.data).map(([key, value]) => <div key={key}><p className="mb-1.5 text-xs font-semibold capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{valueText(value) || '-'}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-400">Modul belum selesai.</p>}
            </section>
          ))}
        </div>
      </article>}
    </StudentAppLayout>
  );
}
