import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { challengeOptions, excitementOptions, improvementOptions, indoorStudyPlaces, outdoorStudyPlaces, relationLabels, targetOptions } from '../data/bekal10-module';

type UpdateData = (key: string, value: unknown) => void;

export type ModuleOneData = {
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

export const moduleOneInitial: ModuleOneData = {
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

function ChoiceGrid({ disabled, onChange, options, selected }: { disabled: boolean; onChange: (value: string[]) => void; options: string[]; selected: string[] }) {
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

function TextArea({ disabled, onChange, placeholder, value }: { disabled: boolean; onChange: (value: string) => void; placeholder: string; value: string }) {
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

export function ModuleOne({ data, disabled, update }: { data: ModuleOneData; disabled: boolean; update: UpdateData }) {
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
