import { Award, BookOpenCheck, GraduationCap, LoaderCircle, Target, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { api } from '../lib/api';
import type { Bekal10Dashboard, Bekal10Portfolio } from '../types/bekal10';

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback = 'Belum tersedia') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function listValue(value: unknown) {
  return Array.isArray(value) && value.length ? value.map(String).join(', ') : 'Belum tersedia';
}

function ProfileItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-7 text-[#101b3f]">{value}</p>
    </div>
  );
}

export function StudentProfilePage() {
  const [dashboard, setDashboard] = useState<Bekal10Dashboard | null>(null);
  const [portfolio, setPortfolio] = useState<Bekal10Portfolio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<Bekal10Dashboard>('/api/student/programs/bekal-10'),
      api<Bekal10Portfolio>('/api/student/programs/bekal-10/portfolio'),
    ])
      .then(([dashboardResponse, portfolioResponse]) => {
        setDashboard(dashboardResponse);
        setPortfolio(portfolioResponse);
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const derived = useMemo(() => {
    const moduleBySlug = new Map((portfolio?.modules ?? []).map((module) => [module.slug, module]));
    const assessment = objectValue(moduleBySlug.get('mengenal-diriku-lebih-dekat')?.data);
    const results = objectValue(assessment.results);
    const riasec = objectValue(results.riasec);
    const vark = objectValue(results.vark);
    const dominantRiasec = Array.isArray(riasec.dominant)
      ? riasec.dominant.map((item) => stringValue(objectValue(item).label, '')).filter(Boolean).join(', ')
      : '';
    const target = objectValue(moduleBySlug.get('target-pengembangan-diri')?.data);
    const academic = objectValue(moduleBySlug.get('merancang-target-prestasi')?.data);

    return {
      riasec: dominantRiasec || 'Belum tersedia',
      vark: stringValue(objectValue(vark.dominant).label),
      developmentTarget: stringValue(target.smartSpecific, listValue(target.developmentAreas)),
      academicTarget: stringValue(academic.academicTarget),
    };
  }, [portfolio]);

  const loading = !dashboard && !portfolio && !error;

  return (
    <StudentAppLayout eyebrow="Profil siswa" title="Profil perkembangan">
      <div className="mx-auto max-w-6xl px-5 py-7 lg:px-7">
        <section className="rounded-lg bg-[#101b3f] p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#ffe08a]">Profil Bekal 10</p>
              <h1 className="mt-2 text-2xl font-semibold">{portfolio?.student.name ?? dashboard?.student.name ?? 'Profil siswa'}</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">{portfolio?.student.schoolName ?? dashboard?.student.schoolName ?? 'Sekolah'} - {portfolio?.student.className ?? dashboard?.student.className ?? 'Kelas belum tersedia'}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-xs text-white/60">Progress keseluruhan</p>
              <p className="mt-1 text-3xl font-semibold">{dashboard?.program.progressPercentage ?? portfolio?.program.progressPercentage ?? 0}%</p>
            </div>
          </div>
        </section>

        {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {loading && <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}

        {!loading && !error && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ProfileItem label="Nama Lengkap" value={portfolio?.student.name ?? dashboard?.student.name ?? 'Belum tersedia'} />
              <ProfileItem label="Kelas" value={portfolio?.student.className ?? dashboard?.student.className ?? 'Belum tersedia'} />
              <ProfileItem label="NISN" value={portfolio?.student.nisn ?? 'Belum tersedia'} />
              <ProfileItem label="RIASEC Dominan" value={derived.riasec} />
              <ProfileItem label="VARK Dominan" value={derived.vark} />
              <ProfileItem label="Progress Keseluruhan" value={`${dashboard?.program.progressPercentage ?? portfolio?.program.progressPercentage ?? 0}%`} />
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Target className="size-5 text-violet-700" />
                  <h2 className="font-semibold text-[#101b3f]">Target Pengembangan Diri</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{derived.developmentTarget}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="size-5 text-emerald-700" />
                  <h2 className="font-semibold text-[#101b3f]">Target Akademik</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{derived.academicTarget}</p>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <BookOpenCheck className="size-5 text-violet-700" />
                <p className="mt-3 text-2xl font-semibold text-[#101b3f]">{dashboard?.program.completedCount ?? portfolio?.program.completedCount ?? 0}/{dashboard?.program.totalModules ?? portfolio?.program.totalModules ?? 7}</p>
                <p className="mt-1 text-sm text-slate-500">Modul selesai</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <Award className="size-5 text-amber-700" />
                <p className="mt-3 text-2xl font-semibold text-[#101b3f]">{portfolio?.badges.length ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500">Badge diperoleh</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <UserRound className="size-5 text-blue-700" />
                <p className="mt-3 text-2xl font-semibold text-[#101b3f]">{portfolio?.program.completed ? 'Siap' : 'Berproses'}</p>
                <p className="mt-1 text-sm text-slate-500">Status portofolio</p>
              </div>
            </section>
          </>
        )}
      </div>
    </StudentAppLayout>
  );
}
