import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleAlert, ExternalLink, LoaderCircle, Save, ShieldAlert, Trophy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { workflows, type WorkflowField } from '../data/program-workflows';
import { emergencyEvents, scholarshipPortal, simulationSteps, type EmergencyEvent, type SimulationOption } from '../data/smart-financial';
import { api } from '../lib/api';
import type { StudentProgramModuleResponse } from '../types/program';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type ProgramPortfolio = {
  modules: Array<{ slug: string; title: string; data: Record<string, unknown> | null }>;
};
type SmartCity = { city: string; housing: number; food: number; transport: number; study: number };
type Scholarship = { name: string; type: string; url: string; description: string };

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function numberInputValue(value: unknown) {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  const numeric = numberValue(value);
  return numeric ? String(numeric) : '';
}

function moneyInputValue(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits ? Number(digits) : '';
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function recordValue(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]));
}

function eventsValue(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function currency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-6"><h2 className="text-lg font-semibold text-[#101b3f]">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}<div className="mt-5">{children}</div></section>;
}

function optionById(stepId: string, optionId: string) {
  return simulationSteps.find((step) => step.id === stepId)?.options.find((option) => option.id === optionId) ?? null;
}

function eventById(eventId: string) {
  return emergencyEvents.find((event) => event.id === eventId) ?? null;
}

function buildSmartMetrics(allData: Record<string, unknown>, monthlyCost: number) {
  const decisions = recordValue(allData.simulationDecisions);
  const pickedOptions = Object.entries(decisions).map(([stepId, optionId]) => optionById(stepId, optionId)).filter(Boolean) as SimulationOption[];
  const pickedEvents = eventsValue(allData.emergencyCards).map(eventById).filter(Boolean) as EmergencyEvent[];
  const decisionBase = pickedOptions.length ? Math.round(pickedOptions.reduce((total, option) => total + option.scoreImpact, 0) / pickedOptions.length * 10) : 0;
  const riskRaw = pickedOptions.reduce((total, option) => total + option.riskImpact, 0) + pickedEvents.reduce((total, event) => total + event.riskImpact, 0);
  const riskScore = Math.max(0, Math.min(100, Math.round(riskRaw)));
  const decisionScore = Math.max(0, Math.min(100, decisionBase));
  const cashImpact = pickedOptions.reduce((total, option) => total + option.cashImpact, 0) + pickedEvents.reduce((total, event) => total + event.cashImpact, 0);
  const startingCash = numberValue(allData.currentSavings) + numberValue(allData.emergencyFund) + numberValue(allData.monthlyAllowance);
  const finalBalance = startingCash + cashImpact - numberValue(allData.monthlySavingPlan);
  const savingAbility = monthlyCost ? Math.min(100, Math.round((numberValue(allData.monthlySavingPlan) / monthlyCost) * 100)) : 0;
  const emergencyFundScore = monthlyCost ? Math.min(100, Math.round((numberValue(allData.emergencyFund) / monthlyCost) * 100)) : 0;
  const readiness = Math.round((savingAbility * 0.4) + (decisionScore * 0.3) + (emergencyFundScore * 0.2) + ((100 - riskScore) * 0.1));
  const lives = Math.max(0, 3 - Math.floor(riskScore / 34) - (finalBalance < 0 ? 1 : 0));
  const status = finalBalance < 0 ? 'Defisit' : readiness >= 75 ? 'Siap terkendali' : readiness >= 50 ? 'Waspada' : 'Perlu strategi ulang';
  const badge = readiness >= 80 ? 'Future Ready Planner' : finalBalance < 0 ? 'Berani Cari Bantuan' : riskScore <= 20 ? 'Si Paling Realistis' : 'Budget Builder';
  const finalDecision = finalBalance < 0
    ? 'Tunda keputusan mahal, cari opsi biaya lebih rendah, dan diskusikan dukungan biaya sebelum berangkat.'
    : readiness >= 75
      ? 'Rencana cukup aman untuk dilanjutkan sambil tetap memantau biaya bulanan dan peluang beasiswa.'
      : 'Rencana bisa dilanjutkan sebagai eksplorasi, tetapi perlu penghematan, dana darurat, dan pembanding kota/kampus.';
  const recommendations = [
    finalBalance < 0 ? 'Kurangi biaya tetap seperti kos, makan, atau transport sebelum memilih kota tujuan.' : 'Pertahankan biaya tetap dan catat pengeluaran mingguan.',
    riskScore > 35 ? 'Hindari paylater dan keputusan spontan untuk kebutuhan konsumtif.' : 'Simpan pola keputusan yang sudah realistis.',
    emergencyFundScore < 50 ? 'Naikkan dana darurat bertahap sebelum hidup mandiri.' : 'Dana darurat sudah mulai membantu, tetap isi ulang setelah dipakai.',
    'Cek KIP Kuliah, beasiswa kampus, dan bantuan pendidikan yang sesuai kondisi keluarga.',
    'Diskusikan rencana akhir dengan Guru BK atau orang tua/wali.',
  ];
  return { badge, decisionScore, emergencyFundScore, finalBalance, finalDecision, lives, pickedEvents, pickedOptions, readiness, recommendations, riskScore, savingAbility, status };
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
  if (field.type === 'number') return <label className="block">{label}<input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} inputMode="numeric" min={field.min} onChange={(event) => update(field.key, moneyInputValue(event.target.value))} placeholder={field.placeholder} type="text" value={numberInputValue(data[field.key])} /></label>;
  return <label className="block">{label}<input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} min={field.min} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} type={field.type === 'date' ? 'date' : 'text'} value={stringValue(data[field.key])} /></label>;
}

function SmartFinancialInsight({ config, data, moduleSlug, portfolio, updateMany }: { config: Record<string, unknown> | null; data: Record<string, unknown>; moduleSlug: string; portfolio: ProgramPortfolio | null; updateMany: (values: Record<string, unknown>) => void }) {
  const cities = Array.isArray(config?.cities) ? config.cities as SmartCity[] : [];
  const scholarships = Array.isArray(config?.scholarships) ? config.scholarships as Scholarship[] : [];
  const selectedCity = cities.find((city) => city.city === stringValue(data.destinationCity));
  const allData = Object.assign({}, ...(portfolio?.modules.map((module) => module.data ?? {}) ?? []), data);
  const cityFromPortfolio = cities.find((city) => city.city === stringValue(allData.destinationCity));
  const monthlyCost = cityFromPortfolio ? cityFromPortfolio.housing + cityFromPortfolio.food + cityFromPortfolio.transport + cityFromPortfolio.study : 0;
  const metrics = buildSmartMetrics(allData, monthlyCost);
  const decisions = recordValue(data.simulationDecisions);
  const pickedEventIds = eventsValue(data.emergencyCards);

  function chooseOption(stepId: string, option: SimulationOption) {
    const nextDecisions = { ...decisions, [stepId]: option.id };
    const nextData = { ...allData, ...data, simulationDecisions: nextDecisions };
    const nextMetrics = buildSmartMetrics(nextData, monthlyCost);
    updateMany({
      simulationDecisions: nextDecisions,
      decisionScore: nextMetrics.decisionScore,
      riskScore: nextMetrics.riskScore,
      finalBalance: nextMetrics.finalBalance,
      lives: nextMetrics.lives,
      readinessScore: nextMetrics.readiness,
      finalDecision: nextMetrics.finalDecision,
      badge: nextMetrics.badge,
    });
  }

  function drawEmergencyCard() {
    const nextEvent = emergencyEvents.find((event) => !pickedEventIds.includes(event.id)) ?? emergencyEvents[0];
    const nextEvents = pickedEventIds.includes(nextEvent.id) ? pickedEventIds : [...pickedEventIds, nextEvent.id];
    const nextData = { ...allData, ...data, emergencyCards: nextEvents };
    const nextMetrics = buildSmartMetrics(nextData, monthlyCost);
    updateMany({
      emergencyCards: nextEvents,
      riskScore: nextMetrics.riskScore,
      finalBalance: nextMetrics.finalBalance,
      lives: nextMetrics.lives,
      readinessScore: nextMetrics.readiness,
      finalDecision: nextMetrics.finalDecision,
      badge: nextMetrics.badge,
    });
  }

  if (moduleSlug === 'pilih-kota-tujuan') {
    return <Section title="Estimasi biaya kota">{selectedCity ? <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Kos/tempat tinggal</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.housing)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Makan</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.food)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Transport</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.transport)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Belajar/lainnya</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.study)}</p></div></div> : <p className="text-sm text-slate-500">Pilih kota tujuan untuk melihat estimasi biaya bulanan.</p>}</Section>;
  }

  if (moduleSlug === 'simulasi-financial-readiness' || moduleSlug === 'hasil-dan-rekomendasi') {
    return <Section description="Coba dulu sebelum boncos beneran. Setiap pilihan memengaruhi saldo, risiko, lives, dan rekomendasi akhir." title="Future Ready Board"><div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]"><div className="rounded-lg bg-[#101b3f] p-5 text-white"><p className="text-sm text-white/60">Skor kesiapan finansial</p><p className="mt-2 text-5xl font-semibold">{metrics.readiness}</p><p className="mt-3 text-xs text-white/60">Status akhir</p><p className="mt-1 text-lg font-semibold">{metrics.status}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="rounded bg-white/10 p-2">Saldo: {currency(metrics.finalBalance)}</span><span className="rounded bg-white/10 p-2">Lives: {metrics.lives}</span><span className="rounded bg-white/10 p-2">Decision: {metrics.decisionScore}</span><span className="rounded bg-white/10 p-2">Risk: {metrics.riskScore}</span></div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Kemampuan menabung</p><p className="mt-1 font-semibold">{metrics.savingAbility}%</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Dana darurat</p><p className="mt-1 font-semibold">{metrics.emergencyFundScore}%</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Badge</p><p className="mt-1 font-semibold">{metrics.badge}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Estimasi biaya kota</p><p className="mt-1 font-semibold">{monthlyCost ? currency(monthlyCost) : '-'}</p></div></div></div>{moduleSlug === 'simulasi-financial-readiness' && <div className="mt-5 grid gap-4"><div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-amber-950">Simulasi 12 langkah</h3><p className="mt-1 text-xs leading-5 text-amber-800">Klik satu keputusan di setiap langkah. Pilihanmu otomatis menghitung skor.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">{Object.keys(decisions).length}/12 keputusan</span></div><div className="mt-4 grid gap-3">{simulationSteps.map((step, index) => <article className="rounded-lg border border-amber-200 bg-white p-3" key={step.id}><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded bg-amber-100 text-xs font-semibold text-amber-800">{index + 1}</span><div><h4 className="font-semibold text-amber-950">{step.title}</h4><p className="mt-1 text-xs leading-5 text-amber-800">{step.prompt}</p></div></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{step.options.map((option) => { const active = decisions[step.id] === option.id; return <button className={`rounded-lg border px-3 py-2 text-left text-xs leading-5 ${active ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'}`} key={option.id} onClick={() => chooseOption(step.id, option)} type="button"><span className="block font-semibold">{option.label}</span><span className="mt-1 block">{option.effect} - {option.cashImpact >= 0 ? '+' : ''}{currency(option.cashImpact)}</span></button>; })}</div></article>)}</div></div><div className="rounded-lg border border-red-200 bg-red-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-red-900">Kartu kejadian darurat</h3><p className="mt-1 text-xs leading-5 text-red-800">Tekan tombol untuk mengambil kejadian tidak terduga.</p></div><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-700 px-4 text-xs font-semibold text-white disabled:opacity-50" disabled={pickedEventIds.length >= emergencyEvents.length} onClick={drawEmergencyCard} type="button"><ShieldAlert className="size-4" /> Ambil emergency card</button></div><div className="mt-3 grid gap-2 md:grid-cols-2">{pickedEventIds.length ? pickedEventIds.map((eventId) => { const event = eventById(eventId); return event ? <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-red-800" key={event.id}><span className="font-semibold">{event.title}:</span> {event.description} ({currency(event.cashImpact)})</p> : null; }) : <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-red-700">Belum ada kartu darurat yang diambil.</p>}</div></div></div>}<div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><Trophy className="mt-0.5 size-5 shrink-0 text-emerald-700" /><div><h3 className="font-semibold text-emerald-950">Rekomendasi keputusan akhir</h3><p className="mt-2 text-sm leading-6 text-emerald-900">{metrics.finalDecision}</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-emerald-800">{metrics.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div>{moduleSlug === 'hasil-dan-rekomendasi' && <div className="mt-5"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold text-[#101b3f]">Portal Beasiswa</h3><Link className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700" to="/app/programs/smart-financial/scholarships">Buka portal lengkap <ArrowRight className="size-3.5" /></Link></div><div className="grid gap-3 md:grid-cols-3">{(scholarships.length ? scholarships : scholarshipPortal).slice(0, 3).map((scholarship) => <a className="rounded-lg border border-slate-200 p-4 hover:border-amber-300" href={scholarship.url} key={scholarship.name} rel="noreferrer" target="_blank"><p className="text-sm font-semibold text-[#101b3f]">{scholarship.name}</p><p className="mt-1 text-xs font-semibold text-amber-700">{scholarship.type}</p><p className="mt-2 text-xs leading-5 text-slate-500">{scholarship.description}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">Link resmi <ExternalLink className="size-3" /></span></a>)}</div></div>}</Section>;
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
      const initial = Object.fromEntries(workflowModule.fields.map((field) => [field.key, field.type === 'multi' ? [] : field.type === 'range' ? field.min ?? 0 : '']));
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

  function updateMany(values: Record<string, unknown>) {
    setData((current) => {
      const next = { ...current, ...values };
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
            {activeWorkflow.programSlug === 'smart-financial' && <SmartFinancialInsight config={moduleData.config} data={data} moduleSlug={activeModule.slug} portfolio={portfolio} updateMany={updateMany} />}
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
