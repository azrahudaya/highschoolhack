import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpenText, GraduationCap, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

type HealthResponse = {
  status: string;
  app: string;
  environment: string;
};

const programs = [
  {
    title: 'Bekal 10',
    grade: 'Kelas X',
    description: 'Adaptasi SMA, pengenalan potensi diri, target akademik, dan portofolio perkembangan awal.',
    icon: BookOpenText,
    status: 'Phase 1',
  },
  {
    title: 'Setting Goal',
    grade: 'Kelas XI',
    description: 'Eksplorasi jurusan, karier, SMART goals, rencana aksi, dan refleksi berkala.',
    icon: GraduationCap,
    status: 'Phase 2',
  },
  {
    title: 'Smart Financial',
    grade: 'Kelas XII',
    description: 'Simulasi biaya hidup, beasiswa, financial readiness score, dan dashboard kesiapan.',
    icon: BarChart3,
    status: 'Phase 3',
  },
];

export function LandingPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: HealthResponse | null) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a className="flex items-center gap-2 font-semibold text-slate-950" href="/">
            <span className="grid size-9 place-items-center rounded-lg bg-[#15224a] text-white">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            HighschoolHack
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a className="hover:text-slate-950" href="#programs">
              Program
            </a>
            <a className="hover:text-slate-950" href="#platform">
              Platform
            </a>
            <a className="hover:text-slate-950" href="#status">
              Status
            </a>
            <a className="rounded-lg border border-slate-300 px-4 py-2 text-slate-800 hover:border-slate-400" href="/login">
              Masuk
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ffe08a] bg-[#fff8dd] px-3 py-1 text-sm font-medium text-[#6f5600]">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Platform BK digital multi-sekolah
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-[#101b3f] md:text-6xl">
            Pendamping siswa SMA untuk mengenali diri dan merancang masa depan.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            HighschoolHack menggabungkan modul bimbingan, asesmen eksploratif, portofolio perkembangan,
            dan dashboard Guru BK dalam satu platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15224a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#22346a]"
              href="/register"
            >
              Mulai Perjalanan
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              href="#platform"
            >
              Struktur Platform
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <div className="rounded-xl bg-[#101b3f] p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <p className="text-sm text-white/70">Dashboard Preview</p>
                <h2 className="text-xl font-semibold">SMA Nusantara</h2>
              </div>
              <Landmark className="size-6 text-[#ffe08a]" aria-hidden="true" />
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-3">
              {['3 Program', 'Multi Sekolah', 'Guru BK'].map((item) => (
                <div key={item} className="rounded-lg bg-white/10 p-3">
                  <p className="text-2xl font-semibold">{item.split(' ')[0]}</p>
                  <p className="text-sm text-white/70">{item.replace(item.split(' ')[0], '').trim() || 'Utama'}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {programs.map((program, index) => (
                <div key={program.title} className="flex items-center gap-3 rounded-lg bg-white p-3 text-slate-900">
                  <span className="grid size-9 place-items-center rounded-md bg-[#ede9fe] text-[#5b21b6]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{program.title}</p>
                    <p className="truncate text-sm text-slate-500">{program.grade}</p>
                  </div>
                  <span className="rounded-full bg-[#fff8dd] px-2 py-1 text-xs font-semibold text-[#6f5600]">
                    {program.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#5b21b6]">Program utama</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#101b3f]">Dibangun untuk kelas X sampai XII</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Semua program tampil dari awal, sementara implementasi lengkap dibangun bertahap agar kualitas produk tetap terjaga.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <article key={program.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-lg bg-[#f1f5ff] text-[#15224a]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {program.grade}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#101b3f]">{program.title}</h3>
                <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">{program.description}</p>
                <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#15224a]">
                  Buka shell program
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['React Client', 'Public site, student app, teacher dashboard, dan admin shell.'],
            ['Express API', 'Auth, role guard, modul, response siswa, dan dashboard data.'],
            ['Heroku Postgres', 'Database utama untuk multi-sekolah dan progress siswa.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-[#101b3f]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="status" className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">API status</p>
          <p className="mt-2 text-lg font-semibold text-[#101b3f]">
            {health ? `${health.app} API ${health.status}` : 'API belum terhubung di dev client'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Environment: {health?.environment ?? 'unknown'}
          </p>
        </div>
      </section>
    </main>
  );
}
