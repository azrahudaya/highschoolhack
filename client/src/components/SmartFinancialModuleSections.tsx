import { ArrowRight, ExternalLink, ShieldAlert, Trophy } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { emergencyEvents, scholarshipPortal, simulationSteps, type EmergencyEvent, type SimulationOption } from '../data/smart-financial';

type ProgramPortfolio = {
  modules: Array<{ slug: string; title: string; data: Record<string, unknown> | null }>;
};

type SmartCity = { city: string; housing: number; food: number; transport: number; study: number };
type Scholarship = { name: string; type: string; url: string; description: string };

const smartFinancialModuleMeta: Record<string, { formTitle: string; formDescription: string; concept: string[] }> = {
  'identitas-dan-target': {
    formTitle: 'Profil Simulasi',
    formDescription: 'Data ini menjadi titik awal simulasi: siapa siswanya, rencana setelah lulus, minat, uang saku, tabungan, dan dana darurat.',
    concept: ['Target setelah lulus dan minat membantu membentuk rekomendasi akademik/karier.', 'Uang saku, tabungan, dan dana darurat menjadi modal awal sebelum masuk ke board.', 'Kota asal, sekolah, dan kelas ikut terbawa ke portofolio PDF.'],
  },
  'pilih-kota-tujuan': {
    formTitle: 'Kota Tujuan dan Strategi Hidup',
    formDescription: 'Kota tujuan menentukan estimasi biaya hidup bulanan yang dipakai untuk menghitung kesiapan menabung dan risiko keputusan.',
    concept: ['Biaya kos, makan, transport, dan belajar dijumlahkan sebagai kebutuhan bulanan.', 'Strategi tinggal membantu siswa membayangkan pilihan hemat sebelum mengambil keputusan.', 'Catatan biaya menjadi bahan diskusi dengan orang tua/wali atau Guru BK.'],
  },
  'simulasi-financial-readiness': {
    formTitle: 'Rencana Menabung dan Refleksi',
    formDescription: 'Rencana menabung digabungkan dengan 12 keputusan board, emergency card, dan refleksi siswa.',
    concept: ['Setiap langkah punya 3 pilihan dengan dampak saldo, decision score, dan risk score.', 'Emergency card mensimulasikan kejadian tidak terduga agar rencana tidak terlalu optimistis.', 'Hasil akhir menghasilkan readiness score, lives, badge, dan rekomendasi keputusan.'],
  },
  'hasil-dan-rekomendasi': {
    formTitle: 'Rekomendasi Perkembangan',
    formDescription: 'Ringkas keputusan akhir menjadi rekomendasi akademik, karier, finansial, dan sosial yang bisa dibawa ke portofolio.',
    concept: ['Rekomendasi akhir menggabungkan kota tujuan, kondisi uang, risiko, dan pilihan board.', 'Portal beasiswa menjadi referensi awal, bukan pengganti pengecekan syarat resmi.', 'PDF portofolio mengambil ringkasan dari seluruh modul Smart Financial.'],
  },
};

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
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
  const decisionBase = pickedOptions.length ? Math.round((pickedOptions.reduce((total, option) => total + option.scoreImpact, 0) / pickedOptions.length) * 10) : 0;
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
  const readinessStatus = readiness >= 90 ? 'Sangat Siap' : readiness >= 75 ? 'Siap' : readiness >= 60 ? 'Cukup Siap' : readiness >= 40 ? 'Perlu Persiapan' : 'Risiko Tinggi';
  const status = finalBalance < 0 ? 'Defisit' : readinessStatus;
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
  return { badge, decisionScore, emergencyFundScore, finalBalance, finalDecision, lives, readiness, recommendations, riskScore, savingAbility, status };
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-6"><h2 className="text-lg font-semibold text-[#101b3f]">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}<div className="mt-5">{children}</div></section>;
}

export function smartFinancialFormMeta(moduleSlug: string) {
  return smartFinancialModuleMeta[moduleSlug] ?? null;
}

export function SmartFinancialConcept({ moduleSlug }: { moduleSlug: string }) {
  const meta = smartFinancialModuleMeta[moduleSlug];
  if (!meta) return null;
  return (
    <Section title="Konsep Modul" description="Alur Smart Financial dibuat sebagai simulasi belajar sebelum siswa mengambil keputusan nyata setelah lulus.">
      <div className="grid gap-3 md:grid-cols-3">
        {meta.concept.map((item, index) => (
          <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900" key={item}>
            <span className="mb-2 grid size-7 place-items-center rounded bg-amber-100 text-xs font-semibold text-amber-800">{index + 1}</span>
            {item}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ScoreSummary({ metrics, monthlyCost }: { metrics: ReturnType<typeof buildSmartMetrics>; monthlyCost: number }) {
  return (
    <div className="lg:sticky lg:top-20">
      <div className="rounded-lg bg-[#101b3f] p-5 text-white">
        <p className="text-sm text-white/60">Skor kesiapan finansial</p>
        <p className="mt-2 text-5xl font-semibold">{metrics.readiness}</p>
        <p className="mt-3 text-xs text-white/60">Status akhir</p>
        <p className="mt-1 text-lg font-semibold">{metrics.status}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded bg-white/10 p-2">Saldo: {currency(metrics.finalBalance)}</span>
          <span className="rounded bg-white/10 p-2">Lives: {metrics.lives}</span>
          <span className="rounded bg-white/10 p-2">Decision: {metrics.decisionScore}</span>
          <span className="rounded bg-white/10 p-2">Risk: {metrics.riskScore}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Kemampuan menabung</p><p className="mt-1 font-semibold">{metrics.savingAbility}%</p></div>
        <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Dana darurat</p><p className="mt-1 font-semibold">{metrics.emergencyFundScore}%</p></div>
        <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Badge</p><p className="mt-1 font-semibold">{metrics.badge}</p></div>
        <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Estimasi biaya kota</p><p className="mt-1 font-semibold">{monthlyCost ? currency(monthlyCost) : '-'}</p></div>
      </div>
    </div>
  );
}

export function SmartFinancialInsight({ config, data, disabled, moduleSlug, portfolio, updateMany }: { config: Record<string, unknown> | null; data: Record<string, unknown>; disabled: boolean; moduleSlug: string; portfolio: ProgramPortfolio | null; updateMany: (values: Record<string, unknown>) => void }) {
  const cities = Array.isArray(config?.cities) ? config.cities as SmartCity[] : [];
  const scholarships = Array.isArray(config?.scholarships) ? config.scholarships as Scholarship[] : [];
  const selectedCity = cities.find((city) => city.city === stringValue(data.destinationCity));
  const allData = Object.assign({}, ...(portfolio?.modules.map((module) => module.data ?? {}) ?? []), data);
  const cityFromPortfolio = cities.find((city) => city.city === stringValue(allData.destinationCity));
  const monthlyCost = cityFromPortfolio ? cityFromPortfolio.housing + cityFromPortfolio.food + cityFromPortfolio.transport + cityFromPortfolio.study : 0;
  const metrics = buildSmartMetrics(allData, monthlyCost);
  const decisions = recordValue(data.simulationDecisions);
  const pickedEventIds = eventsValue(data.emergencyCards);
  const [stepGroup, setStepGroup] = useState(0);
  const stepsPerGroup = 3;
  const totalGroups = Math.ceil(simulationSteps.length / stepsPerGroup);
  const visibleSteps = simulationSteps.slice(stepGroup * stepsPerGroup, stepGroup * stepsPerGroup + stepsPerGroup);

  function chooseOption(stepId: string, option: SimulationOption) {
    if (disabled) return;
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
    if (disabled) return;
    const availableEvents = emergencyEvents.filter((event) => !pickedEventIds.includes(event.id));
    const nextEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)] ?? emergencyEvents[0];
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
    return (
      <Section title="Estimasi biaya kota">
        {selectedCity ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Kos/tempat tinggal</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.housing)}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Makan</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.food)}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Transport</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.transport)}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Belajar/lainnya</p><p className="mt-1 font-semibold text-[#101b3f]">{currency(selectedCity.study)}</p></div>
          </div>
        ) : <p className="text-sm text-slate-500">Pilih kota tujuan untuk melihat estimasi biaya bulanan.</p>}
      </Section>
    );
  }

  if (moduleSlug !== 'simulasi-financial-readiness' && moduleSlug !== 'hasil-dan-rekomendasi') return null;

  return (
    <Section description="Coba dulu sebelum boncos beneran. Setiap pilihan memengaruhi saldo, risiko, lives, dan rekomendasi akhir." title="Future Ready Board">
      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <ScoreSummary metrics={metrics} monthlyCost={monthlyCost} />
        <div className="space-y-4">
          {moduleSlug === 'simulasi-financial-readiness' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-amber-950">Simulasi 12 langkah</h3>
                  <p className="mt-1 text-xs leading-5 text-amber-800">Tampilkan 3 langkah per layar agar keputusan lebih fokus.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">{Object.keys(decisions).length}/12 keputusan</span>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {Array.from({ length: totalGroups }, (_, index) => {
                  const start = index * stepsPerGroup + 1;
                  const end = Math.min(start + stepsPerGroup - 1, simulationSteps.length);
                  const active = stepGroup === index;
                  return <button className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold ${active ? 'border-amber-500 bg-white text-amber-900' : 'border-amber-200 bg-amber-100/60 text-amber-800'}`} key={index} onClick={() => setStepGroup(index)} type="button">Langkah {start}-{end}</button>;
                })}
              </div>
              <div className="mt-4 grid gap-3">
                {visibleSteps.map((step) => {
                  const stepIndex = simulationSteps.findIndex((item) => item.id === step.id);
                  return (
                    <article className="rounded-lg border border-amber-200 bg-white p-3" key={step.id}>
                      <div className="flex items-start gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded bg-amber-100 text-xs font-semibold text-amber-800">{stepIndex + 1}</span>
                        <div>
                          <h4 className="font-semibold text-amber-950">{step.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-amber-800">{step.prompt}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        {step.options.map((option) => {
                          const active = decisions[step.id] === option.id;
                          return <button className={`rounded-lg border px-3 py-2 text-left text-xs leading-5 disabled:cursor-not-allowed disabled:opacity-70 ${active ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'}`} disabled={disabled} key={option.id} onClick={() => chooseOption(step.id, option)} type="button"><span className="block font-semibold">{option.label}</span><span className="mt-1 block">{option.effect} - {option.cashImpact >= 0 ? '+' : ''}{currency(option.cashImpact)}</span></button>;
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button className="h-9 rounded-lg border border-amber-200 bg-white px-3 text-xs font-semibold text-amber-800 disabled:opacity-40" disabled={stepGroup === 0} onClick={() => setStepGroup((current) => Math.max(0, current - 1))} type="button">Sebelumnya</button>
                <button className="inline-flex h-9 items-center gap-1 rounded-lg bg-amber-700 px-3 text-xs font-semibold text-white disabled:opacity-40" disabled={stepGroup === totalGroups - 1} onClick={() => setStepGroup((current) => Math.min(totalGroups - 1, current + 1))} type="button">Berikutnya <ArrowRight className="size-3.5" /></button>
              </div>
            </div>
          )}

          {moduleSlug === 'simulasi-financial-readiness' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Kartu kejadian darurat</h3>
                  <p className="mt-1 text-xs leading-5 text-red-800">Kartu diambil acak dari kejadian yang belum muncul.</p>
                </div>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-700 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled || pickedEventIds.length >= emergencyEvents.length} onClick={drawEmergencyCard} type="button"><ShieldAlert className="size-4" /> Ambil emergency card</button>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {pickedEventIds.length ? pickedEventIds.map((eventId) => {
                  const event = eventById(eventId);
                  return event ? <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-red-800" key={event.id}><span className="font-semibold">{event.title}:</span> {event.description} ({currency(event.cashImpact)})</p> : null;
                }) : <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-red-700">Belum ada kartu darurat yang diambil.</p>}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 size-5 shrink-0 text-emerald-700" />
              <div>
                <h3 className="font-semibold text-emerald-950">Rekomendasi keputusan akhir</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-900">{metrics.finalDecision}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-emerald-800">{metrics.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </div>

          {moduleSlug === 'hasil-dan-rekomendasi' && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[#101b3f]">Portal Beasiswa</h3>
                <Link className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700" to="/app/programs/smart-financial/scholarships">Buka portal lengkap <ArrowRight className="size-3.5" /></Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(scholarships.length ? scholarships : scholarshipPortal).slice(0, 3).map((scholarship) => (
                  <a className="rounded-lg border border-slate-200 p-4 hover:border-amber-300" href={scholarship.url} key={scholarship.name} rel="noreferrer" target="_blank">
                    <p className="text-sm font-semibold text-[#101b3f]">{scholarship.name}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-700">{scholarship.type}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{scholarship.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">Link resmi <ExternalLink className="size-3" /></span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
