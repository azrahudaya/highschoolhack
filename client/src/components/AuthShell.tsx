import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#f8fbff] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-[#101b3f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link className="flex items-center gap-2 font-semibold" to="/">
          <span className="grid size-9 place-items-center rounded-lg bg-white/10">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          HighschoolHack
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#ffe08a]">Perjalanan siswa</p>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight">
            Satu akun untuk berkembang dari kelas X sampai XII.
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-white/70">
            Akses modul pengembangan diri, portofolio, dan pendampingan Guru BK dari sekolahmu.
          </p>
        </div>
        <p className="text-sm text-white/50">HighschoolHack multi-school platform</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link className="mb-8 flex items-center gap-2 font-semibold text-[#101b3f] lg:hidden" to="/">
            <Sparkles className="size-5" aria-hidden="true" />
            HighschoolHack
          </Link>
          <h1 className="text-3xl font-semibold text-[#101b3f]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}
