import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { advancedInitialBySlug, Bekal10AdvancedModule, type AdvancedModuleData } from '../components/Bekal10AdvancedModules';
import { api } from '../lib/api';
import type { Bekal10ModuleResponse, RiasecCategory, VarkCategory } from '../types/bekal10';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type UpdateData = (key: string, value: unknown) => void;
type AnyModuleData = ModuleOneData | ModuleTwoData | AdvancedModuleData;

type ModuleOneData = {
  learningEnvironment: string;
  preferredStudyPlaces: string[];
  studyCompany: string;
  excitement: string[];
  challenges: string[];
  friendRelation: number;
  teacherRelation: number;
  improvements: string[];
  reflectionExperience: string;
  reflectionChallenge: string;
  reflectionStrategy: string;
  targets: string[];
};

type ModuleTwoData = {
  riasecAnswers: Record<string, number>;
  varkAnswers: Record<string, VarkCategory>;
  reflectionFit: string;
  favoriteActivities: string;
  developmentWish: string;
  selfInsight: string;
  results?: {
    riasec: {
      scores: Record<RiasecCategory, number>;
      dominant: Array<{ category: RiasecCategory; label: string }>;
    };
    vark: {
      scores: Record<VarkCategory, number>;
      dominant: { category: VarkCategory; label: string };
    };
  };
};

const moduleOneInitial: ModuleOneData = {
  learningEnvironment: '',
  preferredStudyPlaces: [],
  studyCompany: '',
  excitement: [],
  challenges: [],
  friendRelation: 3,
  teacherRelation: 3,
  improvements: [],
  reflectionExperience: '',
  reflectionChallenge: '',
  reflectionStrategy: '',
  targets: [],
};

const moduleTwoInitial: ModuleTwoData = {
  riasecAnswers: {},
  varkAnswers: {},
  reflectionFit: '',
  favoriteActivities: '',
  developmentWish: '',
  selfInsight: '',
};

const excitementOptions = ['Pelajaran baru', 'Teman baru', 'Kegiatan sekolah', 'Guru baru', 'Lebih mandiri', 'Mencoba hal baru'];
const challengeOptions = ['Mengatur waktu', 'Beradaptasi', 'Memahami pelajaran', 'Berani bertanya', 'Membangun pertemanan', 'Menjaga motivasi'];
const improvementOptions = ['Disiplin belajar', 'Percaya diri', 'Komunikasi', 'Manajemen waktu', 'Kerja sama', 'Konsistensi'];
const targetOptions = ['Mengenal lingkungan sekolah', 'Punya rutinitas belajar', 'Aktif di kelas', 'Menemukan kegiatan yang disukai', 'Menambah teman', 'Lebih berani mencoba'];
const indoorStudyPlaces = ['Kelas', 'Perpustakaan', 'Ruang belajar rumah', 'Laboratorium', 'Ruang BK'];
const outdoorStudyPlaces = ['Taman sekolah', 'Lapangan', 'Kantin saat diskusi', 'Kegiatan lapangan', 'Komunitas luar sekolah'];
const relationLabels = ['Sangat sulit', 'Sulit', 'Cukup', 'Baik', 'Sangat baik'];
const categoryHex: Record<RiasecCategory | VarkCategory, string> = {
  R: '#f59e0b',
  I: '#3b82f6',
  A: '#d946ef',
  S: '#10b981',
  E: '#f97316',
  C: '#0891b2',
  V: '#3b82f6',
  K: '#f59e0b',
};
const revisableSlugs = new Set(['vision-board-sma-ku', 'target-pengembangan-diri']);
const moduleDescriptions: Record<string, string> = {
  'langkah-awalku-di-sma': 'Petakan pengalaman awalmu dan tentukan langkah kecil untuk beradaptasi.',
  'mengenal-diriku-lebih-dekat': 'Kenali kecenderungan minat serta preferensi belajarmu melalui refleksi terarah.',
  'vision-board-sma-ku': 'Susun gambaran tujuan, kegiatan, dan harapanmu selama SMA.',
  'target-pengembangan-diri': 'Ubah area pengembangan pilihanmu menjadi SMART goal yang dapat dipantau.',
  'belajar-dari-perjalanan': 'Tarik kekuatan dan pelajaran dari pengalaman yang sudah kamu lalui.',
  'merancang-target-prestasi': 'Petakan prioritas pelajaran dan strategi untuk target akademik semester.',
  'komitmen-akademikku': 'Tutup perjalanan Bekal 10 dengan kontrak belajar yang konkret.',
};

function mergeModuleData<T extends object>(initial: T, response: Record<string, unknown> | null): T {
  return response ? ({ ...initial, ...response } as T) : initial;
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold text-[#101b3f]">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold text-slate-700">{children}</span>;
}

function ChoiceGrid({
  disabled,
  onChange,
  options,
  selected,
}: {
  disabled: boolean;
  onChange: (value: string[]) => void;
  options: string[];
  selected: string[];
}) {
  function toggle(option: string) {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <label
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
              active ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-slate-200 bg-white text-slate-600'
            } ${disabled ? 'cursor-default opacity-70' : 'hover:border-violet-300'}`}
            key={option}
          >
            <input checked={active} className="sr-only" disabled={disabled} onChange={() => toggle(option)} type="checkbox" />
            <span className={`grid size-5 shrink-0 place-items-center rounded border ${active ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'}`}>
              {active && <Check className="size-3.5" />}
            </span>
            {option}
          </label>
        );
      })}
    </div>
  );
}

function TextArea({
  disabled,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <textarea
      className="min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

function ModuleOneSummary({ data }: { data: ModuleOneData }) {
  const relationAverage = Math.round(((data.friendRelation + data.teacherRelation) / 2) * 10) / 10;
  const mainChallenge = data.challenges[0] ?? 'Belum ada tantangan utama yang dipilih';
  const support = [...data.excitement, ...data.improvements].slice(0, 3);
  const recommendation = data.challenges.includes('Mengatur waktu')
    ? 'Mulai dari jadwal belajar mingguan yang ringan dan evaluasi setiap akhir pekan.'
    : data.challenges.includes('Membangun pertemanan')
      ? 'Coba mulai dari satu interaksi kecil setiap hari, misalnya menyapa atau bertanya tugas.'
      : data.challenges.includes('Berani bertanya')
        ? 'Siapkan satu pertanyaan sebelum kelas selesai agar kamu lebih mudah meminta bantuan.'
        : 'Pilih satu langkah kecil yang bisa dilakukan konsisten selama empat minggu pertama.';

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold text-emerald-950">Ringkasan adaptasi awal</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4"><p className="text-xs font-semibold text-emerald-700">Profil adaptasi</p><p className="mt-1 text-sm leading-6 text-emerald-950">Relasi awal berada di skor {relationAverage}/5 dengan preferensi belajar {data.learningEnvironment || 'belum dipilih'}.</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-xs font-semibold text-emerald-700">Tantangan utama</p><p className="mt-1 text-sm leading-6 text-emerald-950">{mainChallenge}</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-xs font-semibold text-emerald-700">Faktor pendukung</p><p className="mt-1 text-sm leading-6 text-emerald-950">{support.length ? support.join(', ') : 'Belum tersedia'}</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-xs font-semibold text-emerald-700">Rekomendasi adaptasi</p><p className="mt-1 text-sm leading-6 text-emerald-950">{recommendation}</p></div>
      </div>
      <p className="mt-4 rounded-lg bg-white p-4 text-sm leading-6 text-emerald-950">Target adaptasi semester pertama: {data.targets.length ? data.targets.join(', ') : 'pilih satu target kecil dan jalankan secara konsisten.'}</p>
    </section>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const meta = {
    idle: { icon: Save, label: 'Autosave aktif', className: 'text-slate-400' },
    dirty: { icon: Save, label: 'Perubahan belum disimpan', className: 'text-amber-600' },
    saving: { icon: LoaderCircle, label: 'Menyimpan...', className: 'text-blue-600' },
    saved: { icon: CheckCircle2, label: 'Tersimpan otomatis', className: 'text-emerald-600' },
    error: { icon: CircleAlert, label: 'Gagal menyimpan', className: 'text-red-600' },
  }[state];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.className}`}>
      <Icon className={`size-3.5 ${state === 'saving' ? 'animate-spin' : ''}`} />
      {meta.label}
    </span>
  );
}

function ModuleOne({ data, disabled, update }: { data: ModuleOneData; disabled: boolean; update: UpdateData }) {
  const placeOptions = data.learningEnvironment === 'Outdoor' ? outdoorStudyPlaces : data.learningEnvironment === 'Keduanya' ? [...indoorStudyPlaces, ...outdoorStudyPlaces] : indoorStudyPlaces;

  return (
    <div className="space-y-5">
      {disabled && <ModuleOneSummary data={data} />}
      <Section description="Ceritakan bagaimana kamu mengalami masa awal SMA. Tidak ada jawaban benar atau salah." title="Peta awal perjalananku">
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <FieldLabel>Lingkungan belajar yang paling nyaman</FieldLabel>
            <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500" disabled={disabled} onChange={(event) => update('learningEnvironment', event.target.value)} value={data.learningEnvironment}>
              <option value="">Pilih satu</option>
              <option>Indoor</option>
              <option>Outdoor</option>
              <option>Keduanya</option>
            </select>
          </label>
          <label>
            <FieldLabel>Saya paling nyaman belajar...</FieldLabel>
            <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-violet-500" disabled={disabled} onChange={(event) => update('studyCompany', event.target.value)} value={data.studyCompany}>
              <option value="">Pilih satu</option>
              <option>Sendiri</option>
              <option>Dengan satu atau dua teman</option>
              <option>Dalam kelompok</option>
              <option>Dengan pendampingan guru</option>
            </select>
          </label>
        </div>
        <div className="mt-6"><FieldLabel>Tempat belajar yang paling mendukung</FieldLabel><ChoiceGrid disabled={disabled} onChange={(value) => update('preferredStudyPlaces', value)} options={placeOptions} selected={data.preferredStudyPlaces} /></div>
        <div className="mt-6"><FieldLabel>Hal yang membuatku bersemangat</FieldLabel><ChoiceGrid disabled={disabled} onChange={(value) => update('excitement', value)} options={excitementOptions} selected={data.excitement} /></div>
        <div className="mt-6"><FieldLabel>Tantangan yang sedang kuhadapi</FieldLabel><ChoiceGrid disabled={disabled} onChange={(value) => update('challenges', value)} options={challengeOptions} selected={data.challenges} /></div>
      </Section>

      <Section description="Nilai hubunganmu saat ini dari 1 sampai 5." title="Relasi dan adaptasi">
        <div className="grid gap-6 md:grid-cols-2">
          {([['friendRelation', 'Hubunganku dengan teman'], ['teacherRelation', 'Hubunganku dengan guru']] as const).map(([key, label]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => <button className={`h-11 rounded-lg border text-sm font-semibold ${data[key] === value ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 text-slate-500'} disabled:opacity-70`} disabled={disabled} key={value} onClick={() => update(key, value)} type="button">{value}</button>)}
              </div>
              <p className="mt-2 text-xs text-slate-400">{relationLabels[data[key] - 1]}</p>
            </div>
          ))}
        </div>
        <div className="mt-6"><FieldLabel>Kemampuan yang ingin kutingkatkan</FieldLabel><ChoiceGrid disabled={disabled} onChange={(value) => update('improvements', value)} options={improvementOptions} selected={data.improvements} /></div>
      </Section>

      <Section description="Tuliskan dengan jujur agar jawaban ini bisa menjadi titik awal perkembanganmu." title="Refleksi minggu-minggu pertamaku">
        <div className="space-y-5">
          <label><FieldLabel>Pengalaman awal yang paling berkesan</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('reflectionExperience', value)} placeholder="Ceritakan satu pengalaman yang membuatmu senang, penasaran, atau bangga..." value={data.reflectionExperience} /></label>
          <label><FieldLabel>Tantangan yang paling terasa</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('reflectionChallenge', value)} placeholder="Apa yang membuatmu kesulitan dan mengapa?" value={data.reflectionChallenge} /></label>
          <label><FieldLabel>Strategi yang ingin kucoba</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('reflectionStrategy', value)} placeholder="Langkah kecil apa yang akan kamu lakukan?" value={data.reflectionStrategy} /></label>
        </div>
      </Section>

      <Section description="Pilih target paling relevan untuk empat minggu ke depan." title="Target awal">
        <ChoiceGrid disabled={disabled} onChange={(value) => update('targets', value)} options={targetOptions} selected={data.targets} />
      </Section>
    </div>
  );
}

function recommendationForRiasec(category?: RiasecCategory) {
  const recommendations: Record<RiasecCategory, string> = {
    R: 'Coba kegiatan praktik, proyek berbasis alat, eksperimen, olahraga, atau aktivitas yang menghasilkan karya konkret.',
    I: 'Latih rasa ingin tahu lewat riset kecil, membaca sumber tepercaya, eksperimen, dan diskusi berbasis bukti.',
    A: 'Bangun ruang ekspresi melalui desain, tulisan, musik, visual, presentasi kreatif, atau proyek karya.',
    S: 'Kembangkan peran membantu orang lain, tutor sebaya, komunitas, organisasi, atau kegiatan mentoring.',
    E: 'Coba peran memimpin, membuat acara, berjualan kecil, debat, presentasi, atau menggerakkan tim.',
    C: 'Manfaatkan kekuatan struktur lewat jadwal, data, dokumentasi, administrasi, dan target yang terukur.',
  };
  return category ? recommendations[category] : 'Gunakan hasil ini sebagai bahan mencoba aktivitas baru, bukan sebagai batas pilihan.';
}

function recommendationForVark(category?: VarkCategory) {
  const recommendations: Record<VarkCategory, string> = {
    V: 'Gunakan mind map, diagram, warna, timeline, dan gambar untuk menghubungkan konsep.',
    A: 'Coba menjelaskan ulang materi dengan suara, diskusi, tanya jawab, atau rekaman singkat.',
    R: 'Perkuat belajar dengan catatan, daftar istilah, rangkuman, dan membaca ulang secara aktif.',
    K: 'Gunakan praktik, simulasi, contoh nyata, gerakan, atau proyek kecil agar materi terasa konkret.',
  };
  return category ? recommendations[category] : 'Gabungkan beberapa cara belajar sesuai jenis materi dan situasi.';
}

function Results({ config, results }: { config: NonNullable<Bekal10ModuleResponse['config']>; results: NonNullable<ModuleTwoData['results']> }) {
  const riasecData = (Object.entries(results.riasec.scores) as Array<[RiasecCategory, number]>).map(([category, score]) => ({
    category,
    label: config.riasec.labels[category],
    score,
  }));
  const varkData = (Object.entries(results.vark.scores) as Array<[VarkCategory, number]>).map(([category, score]) => ({
    category,
    label: config.vark.labels[category],
    score,
  }));
  const topRiasec = results.riasec.dominant[0]?.category;
  const topVark = results.vark.dominant.category;

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-[#101b3f] p-6 text-white">
        <Sparkles className="size-6 text-[#ffe08a]" />
        <h2 className="mt-4 text-2xl font-semibold">Peta kecenderungan dirimu</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Hasil ini untuk eksplorasi diri, bukan diagnosis psikologis. Gunakan untuk mencoba cara belajar dan aktivitas yang lebih sesuai.</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <Section description={`Tiga kecenderungan teratas: ${results.riasec.dominant.map((item) => item.label).join(', ')}.`} title="Minat RIASEC">
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <RadarChart data={riasecData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 35]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar dataKey="score" fill="#5b21b6" fillOpacity={0.28} stroke="#5b21b6" strokeWidth={2} />
                <Tooltip formatter={(value, _name, item) => [String(value), item.payload.label]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm leading-6 text-violet-950">{recommendationForRiasec(topRiasec)}</p>
        </Section>
        <Section description={`Preferensi paling kuat saat ini: ${results.vark.dominant.label}.`} title="Preferensi belajar VARK">
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={varkData} dataKey="score" innerRadius={62} nameKey="label" outerRadius={98} paddingAngle={3}>
                  {varkData.map((item) => <Cell fill={categoryHex[item.category]} key={item.category} />)}
                </Pie>
                <Tooltip formatter={(value, _name, item) => [String(value), item.payload.label]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2">
            {varkData.map((item) => <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={item.category}>{item.category} - {item.label}: {item.score}</span>)}
          </div>
          <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-950">{recommendationForVark(topVark)}</p>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Preferensi belajar dapat berubah sesuai materi dan situasi. Jangan membatasi diri hanya pada satu cara belajar.</p>
        </Section>
      </div>
    </div>
  );
}

function ModuleTwo({ config, data, disabled, update }: { config: NonNullable<Bekal10ModuleResponse['config']>; data: ModuleTwoData; disabled: boolean; update: UpdateData }) {
  const [category, setCategory] = useState<RiasecCategory>('R');
  const categories = Object.keys(config.riasec.labels) as RiasecCategory[];
  const categoryItems = config.riasec.items.filter((item) => item.category === category);

  return (
    <div className="space-y-5">
      {disabled && data.results && <Results config={config} results={data.results} />}
      <Section description="Nilai seberapa sesuai setiap pernyataan dengan dirimu saat ini." title={`Asesmen minat RIASEC - ${Object.keys(data.riasecAnswers).length}/${config.riasec.items.length}`}>
        <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{categories.map((item) => <button className={`h-10 rounded-lg border text-sm font-semibold ${category === item ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 text-slate-500'}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
        <div className="space-y-4">
          {categoryItems.map((item, index) => (
            <fieldset className="rounded-lg border border-slate-200 p-4" disabled={disabled} key={item.id}>
              <legend className="sr-only">{item.text}</legend>
              <p className="text-sm font-medium leading-6 text-slate-700">{index + 1}. {item.text}</p>
              <div className="mt-3 grid grid-cols-5 gap-2">{config.riasec.scale.map((scale) => <label className={`grid min-h-11 cursor-pointer place-items-center rounded-lg border text-sm font-semibold ${data.riasecAnswers[item.id] === scale.value ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 text-slate-500'}`} key={scale.value} title={scale.label}><input checked={data.riasecAnswers[item.id] === scale.value} className="sr-only" disabled={disabled} name={item.id} onChange={() => update('riasecAnswers', { ...data.riasecAnswers, [item.id]: scale.value })} type="radio" />{scale.value}</label>)}</div>
            </fieldset>
          ))}
        </div>
      </Section>

      <Section description="Pilih satu pilihan yang paling sering kamu lakukan pada setiap situasi." title={`Preferensi belajar - ${Object.keys(data.varkAnswers).length}/${config.vark.items.length}`}>
        <div className="space-y-4">{config.vark.items.map((item, index) => <fieldset className="rounded-lg border border-slate-200 p-4" disabled={disabled} key={item.id}><legend className="text-sm font-semibold leading-6 text-slate-700">{index + 1}. {item.text}</legend><div className="mt-3 grid gap-2 md:grid-cols-2">{item.options.map((option) => <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-5 ${data.varkAnswers[item.id] === option.category ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-600'}`} key={option.category}><input checked={data.varkAnswers[item.id] === option.category} className="mt-0.5 size-4 accent-blue-600" disabled={disabled} name={item.id} onChange={() => update('varkAnswers', { ...data.varkAnswers, [item.id]: option.category })} type="radio" /><span><strong>{option.category}</strong> - {option.text}</span></label>)}</div></fieldset>)}</div>
      </Section>

      <Section description="Hubungkan hasil asesmen dengan pengalaman nyata. Masing-masing jawaban minimal 10 karakter." title="Refleksi mengenal diri">
        <div className="space-y-5">
          <label><FieldLabel>Bagian hasil yang paling terasa sesuai</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('reflectionFit', value)} placeholder="Apa yang terasa paling menggambarkan dirimu?" value={data.reflectionFit} /></label>
          <label><FieldLabel>Aktivitas yang paling kusukai</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('favoriteActivities', value)} placeholder="Aktivitas apa yang membuatmu bersemangat dan mengapa?" value={data.favoriteActivities} /></label>
          <label><FieldLabel>Hal yang ingin kukembangkan</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('developmentWish', value)} placeholder="Kecenderungan atau cara belajar apa yang ingin kamu coba?" value={data.developmentWish} /></label>
          <label><FieldLabel>Wawasan baru tentang diriku</FieldLabel><TextArea disabled={disabled} onChange={(value) => update('selfInsight', value)} placeholder="Apa satu hal baru yang kamu pahami tentang dirimu?" value={data.selfInsight} /></label>
        </div>
      </Section>
    </div>
  );
}

export function Bekal10ModulePage() {
  const { moduleSlug = '' } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState<Bekal10ModuleResponse | null>(null);
  const [data, setData] = useState<AnyModuleData>(moduleOneInitial);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const dataRef = useRef<AnyModuleData>(data);
  const initialized = useRef(false);
  const isModuleOne = moduleSlug === 'langkah-awalku-di-sma';
  const isModuleTwo = moduleSlug === 'mengenal-diriku-lebih-dekat';
  const isAdvancedModule = Boolean(advancedInitialBySlug[moduleSlug]);
  const completed = moduleData?.module.status === 'completed';
  const revisable = revisableSlugs.has(moduleSlug);
  const readOnly = completed && !revisable;

  useEffect(() => {
    initialized.current = false;
    setError('');
    api<Bekal10ModuleResponse>(`/api/student/programs/bekal-10/modules/${moduleSlug}`)
      .then((response) => {
        setModuleData(response);
        const initial = isModuleTwo ? moduleTwoInitial : isModuleOne ? moduleOneInitial : advancedInitialBySlug[moduleSlug] ?? {};
        const merged = mergeModuleData(initial, response.response);
        dataRef.current = merged;
        setData(merged);
        initialized.current = true;
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [isModuleOne, isModuleTwo, moduleSlug]);

  const saveNow = useCallback(async (payload?: AnyModuleData) => {
    if (!initialized.current || readOnly) return true;
    setSaveState('saving');
    try {
      await api(`/api/student/programs/bekal-10/modules/${moduleSlug}`, { method: 'PUT', body: JSON.stringify({ data: payload ?? dataRef.current }) });
      setSaveState('saved');
      return true;
    } catch (requestError) {
      setSaveState('error');
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan perubahan.');
      return false;
    }
  }, [moduleSlug, readOnly]);

  useEffect(() => {
    if (saveState !== 'dirty') return;
    const timeout = window.setTimeout(() => void saveNow(), 900);
    return () => window.clearTimeout(timeout);
  }, [data, saveNow, saveState]);

  useEffect(() => {
    if (saveState !== 'dirty' && saveState !== 'saving') return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  function guardNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (saveState === 'saving' && !window.confirm('Perubahan sedang disimpan. Tetap keluar dari modul?')) event.preventDefault();
  }

  function updateData(key: string, value: unknown) {
    setData((current) => {
      const next = { ...current, [key]: value } as AnyModuleData;
      dataRef.current = next;
      return next;
    });
    setSaveState('dirty');
    setError('');
  }

  async function completeModule() {
    setCompleting(true);
    setError('');
    try {
      const saved = await saveNow(dataRef.current);
      if (!saved) return;
      await api(`/api/student/programs/bekal-10/modules/${moduleSlug}/complete`, { method: 'POST' });
      if (isModuleTwo) {
        const refreshed = await api<Bekal10ModuleResponse>(`/api/student/programs/bekal-10/modules/${moduleSlug}`);
        setModuleData(refreshed);
        const merged = mergeModuleData(moduleTwoInitial, refreshed.response);
        dataRef.current = merged;
        setData(merged);
      } else if (moduleSlug === 'komitmen-akademikku') {
        navigate('/app/portfolio?completed=bekal-10');
      } else {
        navigate('/app/programs/bekal-10');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Modul belum dapat diselesaikan.');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <StudentAppLayout eyebrow="Bekal 10" title={moduleData?.module.title ?? 'Memuat modul'}>
      <div className="mx-auto max-w-6xl px-5 py-6 lg:px-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700" onClick={guardNavigation} to="/app/programs/bekal-10"><ArrowLeft className="size-4" /> Kembali ke program</Link>
          {readOnly ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Modul selesai - mode baca</span> : <div className="flex items-center gap-3">{completed && <span className="text-xs font-semibold text-emerald-700">Modul selesai - dapat diperbarui</span>}<SaveIndicator state={saveState} /></div>}
        </div>

        <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-violet-100 font-semibold text-violet-700">{moduleData?.module.order ?? '-'}</span><div><p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Modul Bekal 10</p><h1 className="mt-1 text-2xl font-semibold text-[#101b3f]">{moduleData?.module.title ?? 'Memuat...'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{moduleDescriptions[moduleSlug] ?? 'Lanjutkan perjalanan perkembangan dirimu.'}</p></div></div>
        </header>

        {error && <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><CircleAlert className="mt-0.5 size-4 shrink-0" />{error}</div>}
        {!moduleData && !error && <div className="grid min-h-72 place-items-center rounded-lg border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}
        {moduleData && isModuleOne && <ModuleOne data={data as ModuleOneData} disabled={readOnly} update={updateData} />}
        {moduleData && isModuleTwo && moduleData.config && <ModuleTwo config={moduleData.config} data={data as ModuleTwoData} disabled={readOnly} update={updateData} />}
        {moduleData && isAdvancedModule && <Bekal10AdvancedModule data={data as AdvancedModuleData} disabled={readOnly} moduleSlug={moduleSlug} update={updateData} />}
        {moduleData && !isModuleOne && !isModuleTwo && !isAdvancedModule && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><BookOpenCheck className="mx-auto size-8 text-slate-400" /><h2 className="mt-4 font-semibold text-[#101b3f]">Konten modul belum tersedia</h2></div>}

        {moduleData && !completed && (isModuleOne || isModuleTwo || isAdvancedModule) && <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><div><p className="text-sm font-semibold text-[#101b3f]">Sudah menyelesaikan semua bagian?</p><p className="text-xs text-slate-500">Jawaban akan divalidasi sebelum tahap berikutnya dibuka.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#101b3f] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={completing} onClick={completeModule} type="button">{completing ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}{isModuleTwo ? 'Selesaikan dan lihat hasil' : moduleSlug === 'komitmen-akademikku' ? 'Selesaikan dan buka portofolio' : 'Selesaikan modul'}</button></div>}
        {saveState === 'saved' && !readOnly && <div aria-live="polite" className="fixed bottom-5 right-5 z-40 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">Data berhasil disimpan otomatis</div>}
      </div>
    </StudentAppLayout>
  );
}
