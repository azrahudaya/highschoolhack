import { Award, CheckCircle2, CircleDashed } from 'lucide-react';
import type { Bekal10Portfolio } from '../types/bekal10';

const hiddenFields = new Set(['riasecAnswers', 'varkAnswers']);
const labels: Record<string, string> = {
  learningEnvironment: 'Lingkungan belajar nyaman',
  studyCompany: 'Preferensi teman belajar',
  excitement: 'Hal yang membuat bersemangat',
  challenges: 'Tantangan adaptasi',
  improvements: 'Kemampuan yang ingin ditingkatkan',
  reflectionExperience: 'Pengalaman awal berkesan',
  reflectionChallenge: 'Tantangan utama',
  reflectionStrategy: 'Strategi adaptasi',
  targets: 'Target awal',
  reflectionFit: 'Hasil yang terasa sesuai',
  favoriteActivities: 'Aktivitas favorit',
  developmentWish: 'Hal yang ingin dikembangkan',
  selfInsight: 'Wawasan tentang diri',
  achievements: 'Prestasi yang ingin dicapai',
  skills: 'Keterampilan yang ingin dikembangkan',
  activities: 'Kegiatan yang ingin diikuti',
  biggestHope: 'Harapan terbesar',
  afterHighSchool: 'Rencana setelah SMA',
  shortTermGoal: 'Tujuan jangka pendek',
  longTermGoal: 'Tujuan jangka panjang',
  developmentAreas: 'Area pengembangan',
  confidence: 'Tingkat keyakinan',
  obstacles: 'Hambatan',
  smartSpecific: 'SMART - Specific',
  smartMeasurable: 'SMART - Measurable',
  smartAchievable: 'SMART - Achievable',
  smartRelevant: 'SMART - Relevant',
  smartTimeBound: 'SMART - Time-Bound',
  strategy: 'Strategi',
  currentProgress: 'Progress awal',
  proudAchievement: 'Prestasi membanggakan',
  failureReaction: 'Respons terhadap kegagalan',
  reflectionFrequency: 'Frekuensi refleksi',
  learningSource: 'Sumber pelajaran hidup',
  futureVision: 'Gambaran masa depan',
  emergingStrength: 'Kekuatan yang muncul',
  developmentArea: 'Area yang perlu dikembangkan',
  favoriteSubject: 'Mata pelajaran favorit',
  favoriteReason: 'Alasan menyukai pelajaran',
  difficultSubjects: 'Mata pelajaran sulit',
  academicTarget: 'Target akademik',
  subjectsToImprove: 'Mata pelajaran prioritas',
  achievementGoals: 'Pencapaian akademik',
  learningStrategies: 'Strategi belajar',
  actionSteps: 'Langkah komitmen',
  personalCommitment: 'Komitmen pribadi',
  supportNeeded: 'Dukungan yang dibutuhkan',
  signedName: 'Tanda tangan digital',
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function Value({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <div className="flex flex-wrap gap-1.5">{value.map((item) => <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600" key={String(item)}>{String(item)}</span>)}</div>;
  if (typeof value === 'number') return <p className="text-sm text-slate-700">{value}{value > 5 ? '%' : '/5'}</p>;
  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{String(value)}</p>;
}

function AssessmentResult({ value }: { value: unknown }) {
  const results = objectValue(value);
  const riasec = objectValue(results.riasec);
  const vark = objectValue(results.vark);
  const dominant = Array.isArray(riasec.dominant) ? riasec.dominant.map((item) => objectValue(item).label).filter(Boolean).join(', ') : '-';
  return <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3"><p className="text-xs font-semibold text-blue-700">RIASEC dominan</p><p className="mt-1 text-sm font-semibold text-blue-950">{dominant}</p></div><div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"><p className="text-xs font-semibold text-emerald-700">Preferensi belajar</p><p className="mt-1 text-sm font-semibold text-emerald-950">{String(objectValue(vark.dominant).label ?? '-')}</p></div></div>;
}

export function PortfolioDocument({ portfolio }: { portfolio: Bekal10Portfolio }) {
  return <article className="portfolio-document mx-auto max-w-5xl bg-white p-5 md:p-8">
    <header className="border-b-2 border-[#101b3f] pb-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase text-violet-700">Portofolio perkembangan siswa</p><h1 className="mt-2 text-3xl font-semibold text-[#101b3f]">{portfolio.student.name}</h1><p className="mt-2 text-sm text-slate-500">{portfolio.student.schoolName} · {portfolio.student.className ?? 'Kelas belum tersedia'} · NISN {portfolio.student.nisn ?? '-'}</p></div><div className="min-w-36 rounded-lg bg-[#101b3f] p-4 text-white"><p className="text-xs text-white/60">Progress Bekal 10</p><p className="mt-1 text-3xl font-semibold">{portfolio.program.progressPercentage}%</p><p className="mt-1 text-xs text-white/60">{portfolio.program.completedCount}/{portfolio.program.totalModules} modul selesai</p></div></div></header>

    <section className="mt-6"><h2 className="text-sm font-semibold uppercase text-slate-500">Badge perkembangan</h2><div className="mt-3 flex flex-wrap gap-2">{portfolio.badges.length ? portfolio.badges.map((badge) => <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800" key={badge.order}><Award className="size-4" />{badge.label}</span>) : <p className="text-sm text-slate-400">Belum ada badge yang diperoleh.</p>}</div></section>

    <div className="mt-7 space-y-5">{portfolio.modules.map((module) => <section className="portfolio-section rounded-lg border border-slate-200 p-5" key={module.id}><div className="flex items-center gap-3"><span className={`grid size-8 place-items-center rounded text-sm font-semibold ${module.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{module.status === 'completed' ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}</span><div><p className="text-xs text-slate-400">Modul {module.order}</p><h2 className="font-semibold text-[#101b3f]">{module.title}</h2></div></div>{module.data ? <div className="mt-5 grid gap-4 md:grid-cols-2">{Object.entries(module.data).filter(([key]) => !hiddenFields.has(key)).map(([key, value]) => key === 'results' ? <div className="md:col-span-2" key={key}><AssessmentResult value={value} /></div> : <div key={key}><p className="mb-1.5 text-xs font-semibold text-slate-500">{labels[key] ?? key}</p><Value value={value} /></div>)}</div> : <p className="mt-4 text-sm text-slate-400">Modul belum selesai.</p>}</section>)}</div>
  </article>;
}
