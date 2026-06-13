import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleAlert, LoaderCircle, Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { workflows, type WorkflowField } from '../data/program-workflows';
import { api } from '../lib/api';
import type { StudentProgramModuleResponse } from '../types/program';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type ProgramPortfolio = {
  modules: Array<{ slug: string; title: string; data: Record<string, unknown> | null }>;
};
type SmartCity = { city: string; housing: number; food: number; transport: number; study: number };
type Scholarship = { name: string; type: string; url: string; description: string };
const simulationSteps = ['Target', 'Kos', 'Makan', 'Transport', 'Buku', 'Laundry', 'Pulsa', 'Organisasi', 'Darurat', 'Side income', 'Review', 'Siap'];
const emergencyEvents = [
  'Laptop rusak saat minggu ujian.',
  'Biaya transport naik karena jadwal padat.',
  'Ada iuran kegiatan mendadak.',
];

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function currency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-6"><h2 className="text-lg font-semibold text-[#101b3f]">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}<div className="mt-5">{children}</div></section>;
}

function SaveIndicator({ state }: { state: SaveState }) {
  const meta = {
    idle: { label: 'Autosave aktif', className: 'text-slate-400' },
    dirty: { label: 'Perubahan belum disimpan', className: 'text-amber-600' },
    saving: { label: 'Menyimpan...', className: 'text-blue-600' },
    saved: { label: 'Tersimpan otomatis', className: 'text-emerald-600' },
    error: { label: 'Gagal menyimpan', className: 'text-red-600' },
  }[state];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.className}`}><Save className="size-3.5" />{meta.label}</span>;
}

function Field({ data, disabled, field, update }: { data: Record<string, unknown>; disabled: boolean; field: WorkflowField; update: (key: string, value: unknown) => void }) {
  const label = <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>;
  if (field.type === 'textarea') return <label className="block">{label}<textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} value={stringValue(data[field.key])} /></label>;
  if (field.type === 'select') return <label className="block">{label}<select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update(field.key, event.target.value)} value={stringValue(data[field.key])}><option value="">Pilih satu</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select></label>;
  if (field.type === 'multi') {
    const selected = arrayValue(data[field.key]);
    return <div>{label}<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{field.options?.map((option) => {
      const active = selected.includes(option);
      return <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${active ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-slate-200 text-slate-600'} ${disabled ? 'cursor-default opacity-70' : 'hover:border-violet-300'}`} key={option}><input checked={active} className="sr-only" disabled={disabled} onChange={() => update(field.key, active ? selected.filter((item) => item !== option) : [...selected, option])} type="checkbox" /><span className={`grid size-5 shrink-0 place-items-center rounded border ${active ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'}`}>{active && <Check className="size-3.5" />}</span>{option}</label>;
    })}</div></div>;
  }
  if (field.type === 'range') return <label className="block">{label}<div className="flex items-center gap-3"><input className="w-full accent-violet-600" disabled={disabled} max={field.max ?? 100} min={field.min ?? 0} onChange={(event) => update(field.key, Number(event.target.value))} type="range" value={numberValue(data[field.key]) || field.min || 0} /><span className="w-12 text-right text-sm font-semibold text-slate-600">{numberValue(data[field.key]) || field.min || 0}</span></div></label>;
  return <label className="block">{label}<input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} min={field.min} onChange={(event) => update(field.key, field.type === 'number' ? Number(event.target.value) : event.target.value)} placeholder={field.placeholder} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={field.type === 'number' ? numberValue(data[field.key]) : stringValue(data[field.key])} /></label>;
}

function SmartFinancialInsight({ config, data, moduleSlug, portfolio }: { config: Record<string, unknown> | null; data: Record<string, unknown>; moduleSlug: string; portfolio: ProgramPortfolio | null }) {
  const cities = Array.isArray(config?.cities) ? config.cities as SmartCity[] : [];
  const scholarships = Array.isArray(config?.scholarships) ? config.scholarships as Scholarship[] : [];
  const selectedCity = cities.find((city) => city.city === stringValue(data.destinationCity));
  const allData = Object.assign({}, ...(portfolio?.modules.map((module) => module.data ?? {}) ?? []), data);
  const cityFromPortfolio = cities.find((city) => city.city === stringValue(allData.destinationCity));
  const monthlyCost = cityFromPortfolio ? cityFromPortfolio.housing + cityFromPortfolio.food + cityFromPortfolio.transport + cityFromPortfolio.study : 0;
  const savingAbility = monthlyCost ? Math.min(100, Math.round((numberValue(allData.monthlySavingPlan) / monthlyCost) * 100)) : 0;
  const emergencyFundScore = monthlyCost ? Math.min(100, Math.round((numberValue(allData.emergencyFund) / monthlyCost) * 100)) : 0;
  const readiness = Math.round((savingAbility * 0.4) + (numberValue(allData.decisionScore) * 0.3) + (emergencyFundScore * 0.2) + ((100 - numberValue(allData.riskScore)) * 0.1));

  if (moduleSlug === 'pilih-kota-tujuan') {
    return <Section title="Estimasi biaya kota">{selectedCity ? <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Kos/tempat tinggal</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.housing)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Makan</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.food)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Transport</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.transport)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Belajar/lainnya</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.study)}</p></div></div> : <p className="text-sm text-slate-500">Pilih kota tujuan untuk melihat estimasi biaya bulanan.</p>}</Section>;
  }

  if (moduleSlug === 'simulasi-financial-readiness' || moduleSlug === 'hasil-dan-rekomendasi') {
    const activeStep = Math.min(12, Math.max(1, Math.ceil(numberValue(allData.decisionScore) / 100 * 12) || 1));
    return <Section description="Formula MVP: kemampuan menabung 40%, kualitas keputusan 30%, dana darurat 20%, risiko 10%." title="Financial readiness score"><div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]"><div className="rounded-lg bg-[#101b3f] p-5 text-white"><p className="text-sm text-white/60">Skor kesiapan</p><p className="mt-2 text-5xl font-semibold">{readiness}</p><p className="mt-2 text-xs text-white/55">Estimasi biaya bulanan: {monthlyCost ? currency(monthlyCost) : '-'}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Kemampuan menabung</p><p className="mt-1 font-semibold">{savingAbility}%</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Skor keputusan</p><p className="mt-1 font-semibold">{numberValue(allData.decisionScore)}%</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Dana darurat</p><p className="mt-1 font-semibold">{emergencyFundScore}%</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Risiko terkendali</p><p className="mt-1 font-semibold">{Math.max(0, 100 - numberValue(allData.riskScore))}%</p></div></div></div>{moduleSlug === 'simulasi-financial-readiness' && <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-semibold text-amber-950">Simulasi 12 langkah</h3><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">{simulationSteps.map((step, index) => <div className={`min-h-16 rounded-lg border p-2 text-xs font-semibold ${index + 1 <= activeStep ? 'border-amber-300 bg-white text-amber-900' : 'border-amber-100 bg-amber-100/60 text-amber-700/60'}`} key={step}><span className="block text-[10px] opacity-70">Langkah {index + 1}</span>{step}</div>)}</div></div><div className="rounded-lg border border-red-200 bg-red-50 p-4"><h3 className="text-sm font-semibold text-red-900">Kartu kejadian darurat</h3><div className="mt-3 space-y-2">{emergencyEvents.map((event) => <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-red-800" key={event}>{event}</p>)}</div></div></div>}{moduleSlug === 'hasil-dan-rekomendasi' && <div className="mt-5 grid gap-3 md:grid-cols-3">{scholarships.map((scholarship) => <a className="rounded-lg border border-slate-200 p-4 hover:border-amber-300" href={scholarship.url} key={scholarship.name} rel="noreferrer" target="_blank"><p className="text-sm font-semibold text-[#101b3f]">{scholarship.name}</p><p className="mt-1 text-xs font-semibold text-amber-700">{scholarship.type}</p><p className="mt-2 text-xs leading-5 text-slate-500">{scholarship.description}</p></a>)}</div>}</Section>;
  }

  return null;
}

export function ProgramModuleAppPage() {
  const { programSlug = '', moduleSlug = '' } = useParams();
  const navigate = useNavigate();
  const workflow = workflows[programSlug as keyof typeof workflows];
  const workflowModule = workflow?.modules.find((item) => item.slug === moduleSlug);
  const [moduleData, setModuleData] = useState<StudentProgramModuleResponse | null>(null);
  const [portfolio, setPortfolio] = useState<ProgramPortfolio | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const dataRef = useRef<Record<string, unknown>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!workflow || !workflowModule) return;
    initialized.current = false;
    setError('');
    Promise.all([
      api<StudentProgramModuleResponse>(`/api/student/programs/${workflow.programSlug}/modules/${workflowModule.slug}`),
      api<ProgramPortfolio>(`/api/student/programs/${workflow.programSlug}/portfolio`),
    ]).then(([moduleResponse, portfolioResponse]) => {
      setModuleData(moduleResponse);
      setPortfolio(portfolioResponse);
      const initial = Object.fromEntries(workflowModule.fields.map((field) => [field.key, field.type === 'multi' ? [] : field.type === 'range' ? field.min ?? 0 : field.type === 'number' ? 0 : '']));
      const merged = { ...initial, ...(moduleResponse.response ?? {}) };
      dataRef.current = merged;
      setData(merged);
      initialized.current = true;
    }).catch((requestError: Error) => setError(requestError.message));
  }, [workflow, workflowModule]);

  const saveNow = useCallback(async (payload?: Record<string, unknown>) => {
    if (!workflow || !workflowModule || !initialized.current) return true;
    setSaveState('saving');
    try {
      await api(`/api/student/programs/${workflow.programSlug}/modules/${workflowModule.slug}`, { method: 'PUT', body: JSON.stringify({ data: payload ?? dataRef.current }) });
      setSaveState('saved');
      return true;
    } catch (requestError) {
      setSaveState('error');
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan perubahan.');
      return false;
    }
  }, [workflow, workflowModule]);

  useEffect(() => {
    if (saveState !== 'dirty') return;
    const timeout = window.setTimeout(() => void saveNow(), 800);
    return () => window.clearTimeout(timeout);
  }, [data, saveNow, saveState]);

  if (!workflow || !workflowModule) return <Navigate to="/app" replace />;
  const activeWorkflow = workflow;
  const activeModule = workflowModule;

  function update(key: string, value: unknown) {
    setData((current) => {
      const next = { ...current, [key]: value };
      dataRef.current = next;
      return next;
    });
    setSaveState('dirty');
    setError('');
  }

  async function complete() {
    setCompleting(true);
    setError('');
    try {
      const saved = await saveNow(dataRef.current);
      if (!saved) return;
      await api(`/api/student/programs/${activeWorkflow.programSlug}/modules/${activeModule.slug}/complete`, { method: 'POST' });
      navigate(`/app/programs/${activeWorkflow.programSlug}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Modul belum dapat diselesaikan.');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <StudentAppLayout eyebrow={activeWorkflow.title} title={activeModule.title}>
      <div className="mx-auto max-w-6xl px-5 py-6 lg:px-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700" to={`/app/programs/${activeWorkflow.programSlug}`}><ArrowLeft className="size-4" /> Kembali ke program</Link>
          <SaveIndicator state={saveState} />
        </div>

        <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg font-semibold text-white" style={{ backgroundColor: activeWorkflow.accent }}>{moduleData?.module.order ?? '-'}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: activeWorkflow.accent }}>{activeWorkflow.grade}</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#101b3f]">{activeModule.title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{activeModule.description}</p>
            </div>
          </div>
        </header>

        {error && <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><CircleAlert className="mt-0.5 size-4 shrink-0" />{error}</div>}
        {!moduleData && !error && <div className="grid min-h-72 place-items-center rounded-lg border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}

        {moduleData && (
          <div className="space-y-5">
            <Section title="Isi modul" description="Jawaban disimpan otomatis. Gunakan bahasa yang jelas agar mudah direfleksikan kembali.">
              <div className="grid gap-5 md:grid-cols-2">
                {activeModule.fields.map((field) => <Field data={data} disabled={false} field={field} key={field.key} update={update} />)}
              </div>
            </Section>
            {activeWorkflow.programSlug === 'smart-financial' && <SmartFinancialInsight config={moduleData.config} data={data} moduleSlug={activeModule.slug} portfolio={portfolio} />}
            {activeWorkflow.programSlug === 'setting-goal' && activeModule.slug === 'dashboard-perkembangan' && <Section title="Visual progress"><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${numberValue(data.progress)}%` }} /></div><p className="mt-3 text-sm text-slate-500">Progress target saat ini: {numberValue(data.progress)}%</p></Section>}
          </div>
        )}

        {moduleData && moduleData.module.status !== 'completed' && <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><div><p className="text-sm font-semibold text-[#101b3f]">Sudah menyelesaikan modul?</p><p className="text-xs text-slate-500">Modul berikutnya akan terbuka setelah ini selesai.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#101b3f] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={completing} onClick={complete} type="button">{completing ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}Selesaikan modul</button></div>}
        {saveState === 'saved' && <div aria-live="polite" className="fixed bottom-5 right-20 z-40 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">Data berhasil disimpan otomatis</div>}
        {moduleData?.module.status === 'completed' && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 className="mr-2 inline size-4" />Modul selesai. Kamu tetap bisa memperbarui catatan jika diperlukan.</div>}
      </div>
    </StudentAppLayout>
  );
}
