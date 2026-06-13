import { ArrowRight, CheckCircle2, ClipboardCheck, LockKeyhole, Route } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { programs } from '../data/content';

export function ProgramDetailPage() {
  const { slug } = useParams();
  const program = programs.find((item) => item.slug === slug);
  if (!program) return <Navigate to="/" replace />;

  const comingSoon = program.status === 'coming_soon';
  const appPath = `/app/programs/${program.slug}`;

  return (
    <PublicLayout>
      <main>
        <section className="border-b border-slate-200 bg-[#101b3f] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#ffe08a]">{program.grade} - {program.eyebrow}</p>
              {comingSoon && <span className="mt-5 inline-flex rounded-full border border-[#ffe08a]/50 bg-[#ffe08a]/15 px-3 py-1 text-xs font-semibold text-[#ffe08a]">Segera hadir</span>}
              <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">{program.title}</h1>
              <p className="mt-4 max-w-2xl text-2xl font-semibold leading-snug text-white">{program.detailHeadline}</p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{program.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {comingSoon ? (
                  <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ffe08a] px-5 py-3 text-sm font-semibold text-[#101b3f]" to="/articles">
                    Ikuti perkembangan <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ffe08a] px-5 py-3 text-sm font-semibold text-[#101b3f]" to={`/register?next=${encodeURIComponent(appPath)}`}>
                    Mulai program <ArrowRight className="size-4" />
                  </Link>
                )}
                <Link className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold" to={`/login?next=${encodeURIComponent(appPath)}`}>
                  Lanjutkan progres
                </Link>
              </div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <p className="text-sm text-white/55">{program.phase}</p>
              <p className="mt-3 text-2xl font-semibold leading-snug">{program.theme}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-4">
                  <p className="text-3xl font-semibold">{program.modules.length}</p>
                  <p className="mt-1 text-sm text-white/60">Modul perjalanan</p>
                </div>
                <div className="rounded-lg bg-white/10 p-4">
                  <p className="text-3xl font-semibold">{program.outcomes.length}</p>
                  <p className="mt-1 text-sm text-white/60">Output utama</p>
                </div>
              </div>
              {comingSoon && <p className="mt-5 rounded-lg bg-white/10 p-4 text-sm leading-6 text-white/70">Program ini sudah dirancang sebagai fase berikutnya, tetapi alur siswa di dashboard belum dibuka untuk pilot Bekal 10.</p>}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="section-label">Alur program</p>
              <h2 className="section-title">Satu tahap membuka tahap berikutnya</h2>
              <p className="mt-5 leading-7 text-slate-600">
                Modul disusun berurutan agar siswa memiliki konteks sebelum membuat keputusan dan target yang lebih besar.
              </p>
            </div>
            <ol className="border-t border-slate-200">
              {program.modules.map((module, index) => (
                <li className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-slate-200 py-5" key={module}>
                  <span className="text-sm font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="font-semibold text-[#101b3f]">{module}</span>
                  {comingSoon ? <LockKeyhole className="size-4 text-slate-400" /> : index === 0 ? <ClipboardCheck className="size-5 text-emerald-600" /> : <LockKeyhole className="size-4 text-slate-400" />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#f1f5ff] py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
              <div>
                <Route className="size-7 text-[#5b21b6]" />
                <h2 className="mt-5 text-3xl font-semibold text-[#101b3f]">Yang siswa bawa pulang</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {program.outcomes.map((outcome) => (
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-5" key={outcome}>
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <p className="font-medium text-[#101b3f]">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
