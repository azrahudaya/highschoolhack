import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Lightbulb,
  NotebookTabs,
  Rocket,
  School,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { articles, programs } from '../data/content';

const programIcons = [BookOpenCheck, Target, WalletCards];
const motivationIcons = [BookOpen, Lightbulb, Rocket, Target, NotebookTabs];

export function LandingPage() {
  return (
    <PublicLayout>
      <main>
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[#101b3f]">
          <img
            alt="Siswa SMA merencanakan masa depan bersama"
            className="absolute inset-0 size-full object-cover object-[64%_center]"
            src="/images/highschoolhack-hero.png"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,48,0.96)_0%,rgba(8,17,48,0.88)_36%,rgba(8,17,48,0.35)_63%,rgba(8,17,48,0.05)_100%)]" />
          <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-6 pb-24 pt-14">
            <div className="max-w-2xl text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#ffe08a]">Perjalanan kelas X sampai XII</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                HighschoolHack
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
                Platform pendamping siswa SMA untuk mengenali potensi diri, merencanakan masa depan, dan mempersiapkan kehidupan setelah lulus.
              </p>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#ffe08a]">
                Masa depan dibentuk dari langkah kecil yang kamu ambil hari ini.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ffe08a] px-5 py-3 text-sm font-semibold text-[#101b3f] hover:bg-[#ffda5c]" to="/register">
                  Mulai perjalananmu <ArrowRight className="size-4" />
                </Link>
                <Link className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15" to="/programs/bekal-10">
                  Jelajahi program
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
                {['Multi-sekolah', 'Portofolio perkembangan', 'Dashboard Guru BK'].map((item) => (
                  <span className="flex items-center gap-2" key={item}>
                    <CheckCircle2 className="size-4 text-[#ffe08a]" /> {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid max-w-xl gap-2 sm:grid-cols-2">
                {([
                  [Target, 'Target masa depan'],
                  [ClipboardCheck, 'Checklist perkembangan'],
                  [TrendingUp, 'Growth chart'],
                  [GraduationCap, 'Rencana kuliah dan karier'],
                ] as const).map(([Icon, label]) => (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur" key={String(label)}>
                    <Icon className="size-4 text-[#ffe08a]" />
                    {String(label)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <a className="absolute bottom-0 left-1/2 w-[min(92%,72rem)] -translate-x-1/2 rounded-t-xl bg-white px-5 py-4 text-sm font-medium text-[#101b3f] shadow-lg" href="#programs">
            Tiga tahap perkembangan, satu perjalanan yang saling terhubung
          </a>
        </section>

        <section className="bg-white py-16" id="programs">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="section-label">Program utama</p>
                <h2 className="section-title">Program Utama HighschoolHack</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
                Setiap program menghasilkan data perkembangan yang dapat dilanjutkan pada tingkat berikutnya dan dipantau oleh Guru BK.
              </p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {programs.map((program, index) => {
                const Icon = programIcons[index];
                return (
                  <article className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70" key={program.slug}>
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-lg bg-[#f1f5ff] text-[#15224a]"><Icon className="size-5" /></span>
                      <span className="text-sm font-semibold" style={{ color: program.accent }}>{program.grade}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {program.visualSignals.map((signal) => (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600" key={signal}>{signal}</span>
                      ))}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[#101b3f]">{program.title}</h3>
                    <p className="mt-3 min-h-28 text-sm leading-6 text-slate-600">{program.description}</p>
                    <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#15224a]" to={`/programs/${program.slug}`}>
                      {program.ctaLabel} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white pb-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-lg border border-[#ffe08a]/70 bg-[#fff6d8] p-6 md:p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-3xl text-xl font-semibold leading-8 text-[#101b3f]">
                  Kesuksesan bukan tentang siapa yang paling pintar, tetapi siapa yang terus belajar dan berkembang.
                </p>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {motivationIcons.map((Icon, index) => (
                    <span className="grid size-10 place-items-center rounded-lg bg-white text-[#5b21b6] shadow-sm" key={index}>
                      <Icon className="size-5" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#f1f5ff] py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-label">Untuk sekolah</p>
              <h2 className="section-title">Guru BK melihat perkembangan, bukan sekadar jawaban formulir.</h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Dashboard menyatukan progres program, profil minat, target, refleksi, dan indikator siswa yang memerlukan perhatian.
              </p>
              <Link className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#15224a] px-5 py-3 text-sm font-semibold text-white" to="/about">
                Pelajari pendekatan kami <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [UsersRound, 'Satu tampilan siswa', 'Cari dan filter siswa berdasarkan sekolah, kelas, serta progres.'],
                [BarChart3, 'Insight yang relevan', 'Lihat distribusi minat, tantangan adaptasi, dan target populer.'],
                [School, 'Multi-sekolah', 'Data setiap sekolah dipisahkan melalui role dan membership.'],
                [GraduationCap, 'Portofolio berkelanjutan', 'Perjalanan kelas X sampai XII tetap terhubung.'],
              ].map(([Icon, title, description]) => (
                <div className="rounded-lg border border-slate-200 bg-white p-5" key={String(title)}>
                  <Icon className="size-5 text-[#5b21b6]" />
                  <h3 className="mt-4 font-semibold text-[#101b3f]">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{String(description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="section-label">Artikel pilihan</p>
                <h2 className="section-title">Bacaan untuk keputusan yang lebih matang</h2>
              </div>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b21b6]" to="/articles">
                Lihat semua artikel <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-9 grid gap-x-8 gap-y-0 md:grid-cols-2">
              {articles.slice(0, 4).map((article) => (
                <Link className="group border-t border-slate-200 py-6" key={article.slug} to={`/articles/${article.slug}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5b21b6]">{article.category}</span>
                    <span className="text-xs text-slate-400">{article.readTime}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[#101b3f] group-hover:text-[#5b21b6]">{article.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{article.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
