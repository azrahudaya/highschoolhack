import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, Plus, Save, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { SmartFinancialConcept, SmartFinancialInsight, smartFinancialFormMeta } from '../components/SmartFinancialModuleSections';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { workflows, type WorkflowField } from '../data/program-workflows';
import { api } from '../lib/api';
import type { StudentProgramModuleResponse } from '../types/program';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type ProgramPortfolio = {
  modules: Array<{ slug: string; title: string; data: Record<string, unknown> | null }>;
};

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function numberInputValue(value: unknown) {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  if (value === 0) return '0';
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

function smartStudentDefaults(config: Record<string, unknown> | null) {
  const student = config?.student;
  if (!student || typeof student !== 'object' || Array.isArray(student)) return {};
  const record = student as Record<string, unknown>;
  return {
    schoolSnapshot: stringValue(record.schoolName),
    classSnapshot: stringValue(record.className),
  };
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
  if (field.type === 'number') return <label className="block">{label}<input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} inputMode="numeric" min={field.min} onChange={(event) => update(field.key, moneyInputValue(event.target.value))} placeholder={field.placeholder} type="text" value={numberInputValue(data[field.key])} /></label>;
  return <label className="block">{label}<input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} min={field.min} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} type={field.type === 'date' ? 'date' : 'text'} value={stringValue(data[field.key])} /></label>;
}

type ActionPriority = 'P1' | 'P2' | 'P3' | 'P4';
type ActionPlan = {
  id: string;
  title: string;
  date: string;
  priority: ActionPriority;
};

const priorityMeta: Record<ActionPriority, { label: string; className: string; dotClassName: string }> = {
  P1: { label: 'Sangat Penting', className: 'border-red-200 bg-red-50 text-red-700', dotClassName: 'bg-red-600' },
  P2: { label: 'Penting', className: 'border-amber-200 bg-amber-50 text-amber-700', dotClassName: 'bg-amber-500' },
  P3: { label: 'Sedang', className: 'border-blue-200 bg-blue-50 text-blue-700', dotClassName: 'bg-blue-500' },
  P4: { label: 'Ringan', className: 'border-slate-200 bg-slate-50 text-slate-600', dotClassName: 'bg-slate-400' },
};

function actionPlansValue(value: unknown): ActionPlan[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const record = item as Record<string, unknown>;
      const priority = String(record.priority ?? 'P2') as ActionPriority;
      if (!['P1', 'P2', 'P3', 'P4'].includes(priority)) return null;
      return {
        id: String(record.id ?? `${record.title ?? ''}-${record.date ?? ''}`),
        title: String(record.title ?? '').trim(),
        date: String(record.date ?? '').trim(),
        priority,
      };
    })
    .filter((item): item is ActionPlan => Boolean(item?.title && item.date));
}

function localDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calendarCells(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ];

  while (cells.length < 42) cells.push(null);
  return cells;
}

function formatPlanDate(value: string) {
  return localDate(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SettingGoalActionPlanner({ data, disabled, updateMany }: { data: Record<string, unknown>; disabled: boolean; updateMany: (values: Record<string, unknown>) => void }) {
  const plans = actionPlansValue(data.actionPlans).sort((a, b) => `${a.date}-${a.priority}`.localeCompare(`${b.date}-${b.priority}`));
  const [draft, setDraft] = useState<{ title: string; date: string; priority: ActionPriority }>({ title: '', date: '', priority: 'P2' });
  const [calendarMonth, setCalendarMonth] = useState(() => monthStart(plans[0]?.date ? localDate(plans[0].date) : new Date()));
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [draftError, setDraftError] = useState('');
  const monthSeeded = useRef(false);
  const monthLabel = calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const cells = calendarCells(calendarMonth);

  useEffect(() => {
    if (monthSeeded.current || !plans[0]?.date) return;
    setCalendarMonth(monthStart(localDate(plans[0].date)));
    monthSeeded.current = true;
  }, [plans]);

  function addPlan() {
    const title = draft.title.trim();
    if (!title || !draft.date) {
      setDraftError('Lengkapi nama rencana dan tanggal.');
      return;
    }

    const plan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      date: draft.date,
      priority: draft.priority,
    };
    updateMany({ actionPlans: [...plans, plan] });
    setCalendarMonth(monthStart(localDate(draft.date)));
    setDraft({ title: '', date: '', priority: 'P2' });
    setDraftError('');
  }

  function removePlan(planId: string) {
    updateMany({ actionPlans: plans.filter((plan) => plan.id !== planId) });
    if (selectedPlan?.id === planId) setSelectedPlan(null);
  }

  return (
    <div className="space-y-5">
      <Section title="Tambah Rencana">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.7fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Nama Rencana</span>
            <input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-50" disabled={disabled} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Belajar sosiologi agar nilai 89" value={draft.title} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Tanggal</span>
            <input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-50" disabled={disabled} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} type="date" value={draft.date} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Prioritas</span>
            <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-50" disabled={disabled} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as ActionPriority }))} value={draft.priority}>
              {Object.entries(priorityMeta).map(([priority, meta]) => <option key={priority} value={priority}>{priority}: {meta.label}</option>)}
            </select>
          </label>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={disabled} onClick={addPlan} type="button"><Plus className="size-4" />Tambah Rencana</button>
        </div>
        {draftError && <p className="mt-3 text-sm font-semibold text-red-600">{draftError}</p>}
      </Section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-[#101b3f]">Kalender Rencana</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} title="Bulan sebelumnya" type="button"><ChevronLeft className="size-4" /></button>
              <p className="min-w-36 text-center text-sm font-semibold text-slate-700">{monthLabel}</p>
              <button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} title="Bulan berikutnya" type="button"><ChevronRight className="size-4" /></button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              const plansForDay = day ? plans.filter((plan) => plan.date === dateKey(day)) : [];
              return (
                <div className={`min-h-20 rounded-lg border p-2 ${day ? 'border-slate-200 bg-white' : 'border-transparent bg-slate-50/60'}`} key={day ? dateKey(day) : `empty-${index}`}>
                  {day && <div className="flex h-full flex-col">
                    <span className="text-xs font-semibold text-slate-500">{day.getDate()}</span>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {plansForDay.slice(0, 4).map((plan) => (
                        <button aria-label={`Lihat ${plan.title}`} className={`size-2.5 rounded-full ${priorityMeta[plan.priority].dotClassName}`} key={plan.id} onClick={() => setSelectedPlan(plan)} title={`${plan.title} - ${plan.priority}`} type="button" />
                      ))}
                    </div>
                  </div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="text-lg font-semibold text-[#101b3f]">Semua Rencana</h2>
          <div className="mt-4 space-y-3">
            {plans.length ? plans.map((plan) => (
              <article className="rounded-lg border border-slate-200 p-4" key={plan.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#101b3f]">{plan.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{formatPlanDate(plan.date)}</p>
                    <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityMeta[plan.priority].className}`}>{plan.priority}: {priorityMeta[plan.priority].label}</span>
                  </div>
                  <button className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={() => removePlan(plan.id)} title="Hapus rencana" type="button"><Trash2 className="size-4" /></button>
                </div>
              </article>
            )) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Belum ada rencana.</p>}
          </div>
        </div>
      </section>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-5">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Detail Rencana</p>
                <h2 className="mt-1 text-lg font-semibold text-[#101b3f]">{selectedPlan.title}</h2>
              </div>
              <button className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" onClick={() => setSelectedPlan(null)} title="Tutup" type="button"><X className="size-4" /></button>
            </div>
            <p className="mt-4 text-sm text-slate-500">{formatPlanDate(selectedPlan.date)}</p>
            <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityMeta[selectedPlan.priority].className}`}>{selectedPlan.priority}: {priorityMeta[selectedPlan.priority].label}</span>
          </div>
        </div>
      )}
    </div>
  );
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
      const defaults = workflow.programSlug === 'smart-financial' && workflowModule.slug === 'identitas-dan-target' ? smartStudentDefaults(moduleResponse.config) : {};
      const merged = { ...initial, ...defaults, ...(moduleResponse.response ?? {}) };
      dataRef.current = merged;
      setData(merged);
      initialized.current = true;
    }).catch((requestError: Error) => setError(requestError.message));
  }, [workflow, workflowModule]);

  const saveNow = useCallback(async (payload?: Record<string, unknown>) => {
    if (!workflow || !workflowModule || !initialized.current) return true;
    if (moduleData?.module.status === 'completed') return true;
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
  }, [moduleData?.module.status, workflow, workflowModule]);

  useEffect(() => {
    if (saveState !== 'dirty') return;
    const timeout = window.setTimeout(() => void saveNow(), 800);
    return () => window.clearTimeout(timeout);
  }, [data, saveNow, saveState]);

  if (!workflow || !workflowModule) return <Navigate to="/app" replace />;
  const activeWorkflow = workflow;
  const activeModule = workflowModule;
  const readOnly = moduleData?.module.status === 'completed';
  const smartMeta = activeWorkflow.programSlug === 'smart-financial' ? smartFinancialFormMeta(activeModule.slug) : undefined;

  function update(key: string, value: unknown) {
    if (readOnly) return;
    setData((current) => {
      const next = { ...current, [key]: value };
      dataRef.current = next;
      return next;
    });
    setSaveState('dirty');
    setError('');
  }

  function updateMany(values: Record<string, unknown>) {
    if (readOnly) return;
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
            {activeWorkflow.programSlug === 'smart-financial' && <SmartFinancialConcept moduleSlug={activeModule.slug} />}
            {activeModule.fields.length > 0 && (
              <Section
                title={smartMeta?.formTitle ?? (activeWorkflow.programSlug === 'setting-goal' && activeModule.slug === 'goal-setting' ? 'Empat Target Utama' : 'Isi modul')}
                description={smartMeta?.formDescription ?? 'Jawaban disimpan otomatis. Gunakan bahasa yang jelas agar mudah direfleksikan kembali.'}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  {activeModule.fields.map((field) => <Field data={data} disabled={Boolean(readOnly)} field={field} key={field.key} update={update} />)}
                </div>
              </Section>
            )}
            {activeWorkflow.programSlug === 'setting-goal' && activeModule.slug === 'rencana-aksi' && <SettingGoalActionPlanner data={data} disabled={Boolean(readOnly)} updateMany={updateMany} />}
            {activeWorkflow.programSlug === 'smart-financial' && <SmartFinancialInsight config={moduleData.config} data={data} disabled={Boolean(readOnly)} moduleSlug={activeModule.slug} portfolio={portfolio} updateMany={updateMany} />}
            {activeWorkflow.programSlug === 'setting-goal' && activeModule.slug === 'dashboard-perkembangan' && <Section title="Visual progress"><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${numberValue(data.progress)}%` }} /></div><p className="mt-3 text-sm text-slate-500">Progress target saat ini: {numberValue(data.progress)}%</p></Section>}
          </div>
        )}

        {moduleData && moduleData.module.status !== 'completed' && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur md:sticky md:bottom-4"><div><p className="text-sm font-semibold text-[#101b3f]">Sudah menyelesaikan modul?</p><p className="text-xs text-slate-500">Modul berikutnya akan terbuka setelah ini selesai.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#101b3f] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={completing} onClick={complete} type="button">{completing ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}Selesaikan modul</button></div>}
        {saveState === 'saved' && <div aria-live="polite" className="fixed bottom-5 right-20 z-40 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">Data berhasil disimpan otomatis</div>}
        {moduleData?.module.status === 'completed' && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 className="mr-2 inline size-4" />Modul selesai. Jawaban dikunci agar portofolio tetap konsisten.</div>}
      </div>
    </StudentAppLayout>
  );
}
