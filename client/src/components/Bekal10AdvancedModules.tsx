import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export type AdvancedModuleData = Record<string, unknown>;
type UpdateData = (key: string, value: unknown) => void;

export const advancedInitialBySlug: Record<string, AdvancedModuleData> = {
  'vision-board-sma-ku': { achievements: [], skills: [], activities: [], biggestHope: '', afterHighSchool: '', shortTermGoal: '', longTermGoal: '' },
  'target-pengembangan-diri': { developmentAreas: [], confidence: 3, obstacles: [], smartSpecific: '', smartMeasurable: '', smartAchievable: '', smartRelevant: '', smartTimeBound: '', strategy: '', currentProgress: 0, checkInDate: '', checkInNote: '' },
  'belajar-dari-perjalanan': { proudAchievement: '', failureReaction: '', reflectionFrequency: '', learningSource: '', futureVision: '', emergingStrength: '', developmentArea: '' },
  'merancang-target-prestasi': { favoriteSubject: '', favoriteReason: '', difficultSubjects: [], academicTarget: '', subjectsToImprove: [], achievementGoals: [], learningStrategies: [] },
  'komitmen-akademikku': { actionSteps: [], confidence: 3, personalCommitment: '', supportNeeded: '', signedName: '' },
};

const achievements = ['Nilai akademik meningkat', 'Masuk peringkat kelas', 'Menang lomba', 'Aktif berorganisasi', 'Membuat karya', 'Memberi dampak sosial'];
const skills = ['Komunikasi', 'Kepemimpinan', 'Bahasa asing', 'Teknologi', 'Kreativitas', 'Manajemen waktu', 'Kerja sama', 'Public speaking'];
const activities = ['OSIS/MPK', 'PIK-R', 'PMR', 'Pramuka', 'Olahraga', 'Seni', 'Klub akademik', 'Komunitas sosial'];
const developmentAreas = ['Kepercayaan diri', 'Komunikasi', 'Kepemimpinan', 'Kedisiplinan', 'Manajemen waktu', 'Kemampuan belajar', 'Kemampuan sosial', 'Pengelolaan emosi', 'Kemandirian', 'Kreativitas'];
const obstacles = ['Kurang motivasi', 'Sulit membagi waktu', 'Kurang dukungan lingkungan', 'Kurang percaya diri', 'Belum memiliki strategi yang tepat'];
const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi', 'Geografi', 'Sejarah', 'Informatika', 'Seni'];
const academicGoals = ['Nilai rata-rata meningkat', 'Masuk peringkat kelas', 'Mengikuti lomba akademik/olimpiade', 'Menjadi tutor sebaya', 'Menyelesaikan proyek akademik'];
const learningStrategies = ['Membuat jadwal belajar', 'Latihan soal rutin', 'Belajar kelompok', 'Bertanya kepada guru', 'Membuat rangkuman', 'Mengurangi distraksi'];
const actionSteps = ['Belajar sesuai jadwal', 'Mencatat progres mingguan', 'Meminta umpan balik guru', 'Belajar bersama teman', 'Mengulang materi sulit', 'Menjaga waktu istirahat'];

function stringValue(data: AdvancedModuleData, key: string) {
  return typeof data[key] === 'string' ? data[key] as string : '';
}

function numberValue(data: AdvancedModuleData, key: string, fallback = 0) {
  return typeof data[key] === 'number' ? data[key] as number : fallback;
}

function arrayValue(data: AdvancedModuleData, key: string) {
  return Array.isArray(data[key]) ? data[key] as string[] : [];
}

function Section({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-6"><h2 className="text-lg font-semibold text-[#101b3f]">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p><div className="mt-5">{children}</div></section>;
}

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold text-slate-700">{children}</span>;
}

function Text({ data, disabled, field, label, placeholder, update }: { data: AdvancedModuleData; disabled: boolean; field: string; label: string; placeholder: string; update: UpdateData }) {
  return <label className="block"><Label>{label}</Label><textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} value={stringValue(data, field)} /></label>;
}

function Choices({ data, disabled, field, options, update }: { data: AdvancedModuleData; disabled: boolean; field: string; options: string[]; update: UpdateData }) {
  const selected = arrayValue(data, field);
  return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{options.map((option) => {
    const active = selected.includes(option);
    return <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${active ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-slate-200 text-slate-600'} ${disabled ? 'cursor-default opacity-70' : 'hover:border-violet-300'}`} key={option}><input checked={active} className="sr-only" disabled={disabled} onChange={() => update(field, active ? selected.filter((item) => item !== option) : [...selected, option])} type="checkbox" /><span className={`grid size-5 shrink-0 place-items-center rounded border ${active ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'}`}>{active && <Check className="size-3.5" />}</span>{option}</label>;
  })}</div>;
}

function Select({ data, disabled, field, label, options, update }: { data: AdvancedModuleData; disabled: boolean; field: string; label: string; options: string[]; update: UpdateData }) {
  return <label className="block"><Label>{label}</Label><select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update(field, event.target.value)} value={stringValue(data, field)}><option value="">Pilih satu</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Scale({ data, disabled, field, label, update }: { data: AdvancedModuleData; disabled: boolean; field: string; label: string; update: UpdateData }) {
  const value = numberValue(data, field, 3);
  return <div><Label>{label}</Label><div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((item) => <button className={`h-11 rounded-lg border text-sm font-semibold ${value === item ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 text-slate-500'}`} disabled={disabled} key={item} onClick={() => update(field, item)} type="button">{item}</button>)}</div><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Belum yakin</span><span>Sangat yakin</span></div></div>;
}

const smartGuide = [
  ['S', 'Specific', 'Target jelas: apa yang ingin dicapai dan dalam konteks apa.'],
  ['M', 'Measurable', 'Ada ukuran kemajuan, misalnya nilai, jumlah latihan, frekuensi, atau bukti karya.'],
  ['A', 'Achievable', 'Masuk akal dengan waktu, kemampuan, dukungan, dan kondisi saat ini.'],
  ['R', 'Relevant', 'Penting untuk tujuan diri sendiri, bukan sekadar ikut orang lain.'],
  ['T', 'Time-Bound', 'Punya batas waktu agar bisa dievaluasi.'],
];

function SmartGoalGuide() {
  return <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-sm font-semibold text-violet-950">SMART goal adalah cara menulis target agar tidak berhenti sebagai niat umum.</p><p className="mt-2 text-sm leading-6 text-violet-900">Contoh kurang jelas: "ingin lebih rajin belajar". Contoh SMART: "selama 4 minggu, saya latihan 20 soal matematika setiap Selasa dan Kamis agar nilai kuis berikutnya naik minimal 10 poin".</p><div className="mt-4 grid gap-3 md:grid-cols-5">{smartGuide.map(([letter, title, description]) => <div className="rounded-lg bg-white p-3" key={letter}><p className="text-xl font-semibold text-violet-700">{letter}</p><p className="mt-1 text-sm font-semibold text-[#101b3f]">{title}</p><p className="mt-2 text-xs leading-5 text-slate-600">{description}</p></div>)}</div></div>;
}

function VisionBoard({ data, disabled, update }: CommonProps) {
  const boardItems = [
    ['Prestasi', arrayValue(data, 'achievements').slice(0, 3).join(', ') || 'Pilih prestasi yang ingin dicapai'],
    ['Skill', arrayValue(data, 'skills').slice(0, 3).join(', ') || 'Pilih keterampilan utama'],
    ['Kegiatan', arrayValue(data, 'activities').slice(0, 3).join(', ') || 'Pilih kegiatan pendukung'],
    ['Harapan', stringValue(data, 'biggestHope') || 'Tulis harapan terbesar'],
  ];
  return <div className="space-y-5"><Section description="Pilih gambaran pencapaian yang ingin kamu bangun selama SMA." title="Arah yang ingin kutuju"><Label>Prestasi yang ingin dicapai</Label><Choices data={data} disabled={disabled} field="achievements" options={achievements} update={update} /><div className="mt-6"><Label>Keterampilan yang ingin dikembangkan</Label><Choices data={data} disabled={disabled} field="skills" options={skills} update={update} /></div><div className="mt-6"><Label>Organisasi atau kegiatan yang ingin diikuti</Label><Choices data={data} disabled={disabled} field="activities" options={activities} update={update} /></div></Section><Section description="Ubah bayangan masa depan menjadi tujuan yang lebih jelas." title="Vision board digital"><div className="grid gap-5 md:grid-cols-2"><Text data={data} disabled={disabled} field="biggestHope" label="Harapan terbesar selama SMA" placeholder="Hal apa yang paling ingin kamu wujudkan?" update={update} /><Text data={data} disabled={disabled} field="afterHighSchool" label="Rencana setelah SMA" placeholder="Apa yang ingin kamu lakukan setelah lulus?" update={update} /><Text data={data} disabled={disabled} field="shortTermGoal" label="Tujuan jangka pendek" placeholder="Apa yang ingin dicapai dalam 6-12 bulan?" update={update} /><Text data={data} disabled={disabled} field="longTermGoal" label="Tujuan jangka panjang" placeholder="Gambarkan dirimu beberapa tahun ke depan." update={update} /></div><div className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-sm font-semibold text-violet-950">Preview Vision Board</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{boardItems.map(([title, value]) => <div className="rounded-lg bg-white p-4" key={title}><p className="text-xs font-semibold uppercase tracking-[0.08em] text-violet-700">{title}</p><p className="mt-2 text-sm leading-6 text-slate-700">{value}</p></div>)}</div></div></Section></div>;
}

function DevelopmentTarget({ data, disabled, update }: CommonProps) {
  return <div className="space-y-5"><Section description="Fokus pada beberapa area yang paling penting bagimu saat ini." title="Target pengembangan diri"><Label>Bidang yang ingin dikembangkan</Label><Choices data={data} disabled={disabled} field="developmentAreas" options={developmentAreas} update={update} /><div className="mt-6"><Scale data={data} disabled={disabled} field="confidence" label="Seberapa yakin kamu dapat mengembangkan diri?" update={update} /></div><div className="mt-6"><Label>Hambatan yang diperkirakan</Label><Choices data={data} disabled={disabled} field="obstacles" options={obstacles} update={update} /></div></Section><Section description="Susun target dengan kerangka Specific, Measurable, Achievable, Relevant, dan Time-Bound." title="SMART goal-ku"><SmartGoalGuide /><div className="grid gap-5 md:grid-cols-2"><Text data={data} disabled={disabled} field="smartSpecific" label="Specific" placeholder="Apa tepatnya yang ingin kamu capai?" update={update} /><Text data={data} disabled={disabled} field="smartMeasurable" label="Measurable" placeholder="Bagaimana kamu mengukur kemajuannya?" update={update} /><Text data={data} disabled={disabled} field="smartAchievable" label="Achievable" placeholder="Mengapa target ini realistis?" update={update} /><Text data={data} disabled={disabled} field="smartRelevant" label="Relevant" placeholder="Mengapa target ini penting bagimu?" update={update} /><Text data={data} disabled={disabled} field="smartTimeBound" label="Time-Bound" placeholder="Kapan target ini akan dicapai?" update={update} /><Text data={data} disabled={disabled} field="strategy" label="Strategi utama" placeholder="Langkah apa yang akan kamu jalankan?" update={update} /></div><label className="mt-6 block"><Label>Progress awal: {numberValue(data, 'currentProgress')}%</Label><input className="w-full accent-violet-600" disabled={disabled} max="100" min="0" onChange={(event) => update('currentProgress', Number(event.target.value))} step="5" type="range" value={numberValue(data, 'currentProgress')} /></label></Section><Section description="Catat pemeriksaan berkala agar target tidak berhenti sebagai rencana." title="Check-in perkembangan"><div className="grid gap-5 md:grid-cols-2"><label className="block"><Label>Tanggal check-in</Label><input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update('checkInDate', event.target.value)} type="date" value={stringValue(data, 'checkInDate')} /></label><Text data={data} disabled={disabled} field="checkInNote" label="Catatan progress" placeholder="Apa perkembangan yang sudah terlihat dan apa langkah berikutnya?" update={update} /></div></Section></div>;
}

function JourneyReflection({ data, disabled, update }: CommonProps) {
  const summary = [
    ['Kekuatan', stringValue(data, 'emergingStrength') || 'Belum ditulis'],
    ['Area tumbuh', stringValue(data, 'developmentArea') || 'Belum ditulis'],
    ['Langkah berikutnya', stringValue(data, 'futureVision') || 'Belum ditulis'],
  ];
  return <div className="space-y-5"><Section description="Pengalaman baik dan sulit sama-sama dapat menunjukkan kekuatanmu." title="Belajar dari pengalaman"><div className="grid gap-5 md:grid-cols-2"><Text data={data} disabled={disabled} field="proudAchievement" label="Prestasi yang paling membanggakan" placeholder="Ceritakan pencapaian dan usahamu." update={update} /><Text data={data} disabled={disabled} field="futureVision" label="Gambaran masa depan" placeholder="Masa depan seperti apa yang ingin kamu bangun?" update={update} /><Select data={data} disabled={disabled} field="failureReaction" label="Saat mengalami kegagalan, saya..." options={['Mencoba lagi dengan cara berbeda', 'Mencari bantuan orang lain', 'Mengevaluasi penyebabnya', 'Butuh waktu sebelum mencoba lagi']} update={update} /><Select data={data} disabled={disabled} field="reflectionFrequency" label="Saya merefleksikan pengalaman..." options={['Hampir setiap hari', 'Setiap minggu', 'Kadang-kadang', 'Saat ada masalah saja']} update={update} /><Select data={data} disabled={disabled} field="learningSource" label="Pelajaran hidup paling berharga berasal dari..." options={['Keluarga', 'Teman', 'Guru', 'Kegagalan', 'Pengalaman organisasi', 'Belajar mandiri']} update={update} /></div></Section><Section description="Tarik insight yang bisa digunakan untuk langkah berikutnya." title="Insight perkembangan diri"><div className="grid gap-5 md:grid-cols-2"><Text data={data} disabled={disabled} field="emergingStrength" label="Kekuatan yang muncul dari pengalaman" placeholder="Kekuatan apa yang baru kamu sadari?" update={update} /><Text data={data} disabled={disabled} field="developmentArea" label="Area yang masih perlu dikembangkan" placeholder="Apa yang ingin kamu perbaiki?" update={update} /></div><div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-[#101b3f]">Ringkasan insight</p><div className="mt-3 grid gap-3 md:grid-cols-3">{summary.map(([title, value]) => <div className="rounded-lg bg-white p-4" key={title}><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{title}</p><p className="mt-2 text-sm leading-6 text-slate-700">{value}</p></div>)}</div></div></Section></div>;
}

function AcademicTarget({ data, disabled, update }: CommonProps) {
  const difficult = arrayValue(data, 'difficultSubjects');
  const improve = arrayValue(data, 'subjectsToImprove');
  const priority = subjects.filter((subject) => difficult.includes(subject) || improve.includes(subject)).slice(0, 8);
  return <div className="space-y-5"><Section description="Kenali pelajaran yang menjadi kekuatan dan prioritas perbaikanmu." title="Peta akademikku"><div className="grid gap-5 md:grid-cols-2"><Select data={data} disabled={disabled} field="favoriteSubject" label="Mata pelajaran yang paling disukai" options={subjects} update={update} /><Text data={data} disabled={disabled} field="favoriteReason" label="Alasan menyukai pelajaran tersebut" placeholder="Apa yang membuat pelajaran ini menarik?" update={update} /></div><div className="mt-6"><Label>Mata pelajaran yang sulit dipahami</Label><Choices data={data} disabled={disabled} field="difficultSubjects" options={subjects} update={update} /></div><div className="mt-6"><Label>Mata pelajaran yang ingin ditingkatkan</Label><Choices data={data} disabled={disabled} field="subjectsToImprove" options={subjects} update={update} /></div><div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-950">Peta prioritas pelajaran</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{priority.length ? priority.map((subject) => <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm" key={subject}><span className="font-semibold text-slate-700">{subject}</span><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{difficult.includes(subject) && improve.includes(subject) ? 'Sulit dan penting' : difficult.includes(subject) ? 'Sulit' : 'Ingin ditingkatkan'}</span></div>) : <p className="text-sm text-blue-800">Pilih pelajaran sulit atau prioritas untuk melihat peta.</p>}</div></div></Section><Section description="Susun target semester beserta strategi yang akan digunakan." title="Rencana prestasi"><Text data={data} disabled={disabled} field="academicTarget" label="Target akademik semester ini" placeholder="Tuliskan target yang jelas dan dapat diukur." update={update} /><div className="mt-6"><Label>Pencapaian yang ingin diraih</Label><Choices data={data} disabled={disabled} field="achievementGoals" options={academicGoals} update={update} /></div><div className="mt-6"><Label>Strategi belajar yang dipilih</Label><Choices data={data} disabled={disabled} field="learningStrategies" options={learningStrategies} update={update} /></div></Section></div>;
}

function AcademicCommitment({ data, disabled, update }: CommonProps) {
  return <div className="space-y-5"><Section description="Pilih tindakan konkret yang akan menjadi rutinitas belajarmu." title="Strategi komitmen"><Label>Langkah yang akan dilakukan</Label><Choices data={data} disabled={disabled} field="actionSteps" options={actionSteps} update={update} /><div className="mt-6"><Scale data={data} disabled={disabled} field="confidence" label="Seberapa yakin kamu dapat menjalankannya?" update={update} /></div><div className="mt-6"><Text data={data} disabled={disabled} field="supportNeeded" label="Dukungan yang kubutuhkan" placeholder="Siapa atau apa yang dapat membantumu konsisten?" update={update} /></div></Section><Section description="Kontrak ini menjadi pengingat atas pilihan dan tanggung jawabmu sendiri." title="Kontrak belajar digital"><Text data={data} disabled={disabled} field="personalCommitment" label="Komitmen untuk diriku sendiri" placeholder="Tuliskan janji yang spesifik dan bermakna bagimu." update={update} /><label className="mt-5 block"><Label>Nama lengkap sebagai tanda tangan</Label><input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50" disabled={disabled} onChange={(event) => update('signedName', event.target.value)} placeholder="Ketik nama lengkapmu" value={stringValue(data, 'signedName')} /></label><div className="mt-6 rounded-lg border-2 border-[#101b3f] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Kartu kontrak akademik</p><h3 className="mt-2 text-xl font-semibold text-[#101b3f]">{stringValue(data, 'signedName') || 'Nama siswa'}</h3><p className="mt-4 text-sm leading-6 text-slate-700">{stringValue(data, 'personalCommitment') || 'Tuliskan komitmen belajarmu agar kartu ini terisi.'}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">Dukungan dibutuhkan</p><p className="mt-1 text-sm text-slate-700">{stringValue(data, 'supportNeeded') || '-'}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">Tanggal</p><p className="mt-1 text-sm text-slate-700">{new Date().toLocaleDateString('id-ID')}</p></div></div></div></Section></div>;
}

type CommonProps = { data: AdvancedModuleData; disabled: boolean; update: UpdateData };

export function Bekal10AdvancedModule({ data, disabled, moduleSlug, update }: CommonProps & { moduleSlug: string }) {
  if (moduleSlug === 'vision-board-sma-ku') return <VisionBoard data={data} disabled={disabled} update={update} />;
  if (moduleSlug === 'target-pengembangan-diri') return <DevelopmentTarget data={data} disabled={disabled} update={update} />;
  if (moduleSlug === 'belajar-dari-perjalanan') return <JourneyReflection data={data} disabled={disabled} update={update} />;
  if (moduleSlug === 'merancang-target-prestasi') return <AcademicTarget data={data} disabled={disabled} update={update} />;
  if (moduleSlug === 'komitmen-akademikku') return <AcademicCommitment data={data} disabled={disabled} update={update} />;
  return null;
}
