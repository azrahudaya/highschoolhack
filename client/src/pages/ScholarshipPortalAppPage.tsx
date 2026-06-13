import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { scholarshipPortal } from '../data/smart-financial';

const filters = ['Semua', 'Pemerintah', 'Talenta', 'Internasional', 'Studi lanjut'];

export function ScholarshipPortalAppPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const visible = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    return scholarshipPortal.filter((item) => {
      const matchesFilter = filter === 'Semua' || item.type === filter;
      const matchesQuery = !keyword || [item.name, item.provider, item.description, item.fit.join(' ')].join(' ').toLowerCase().includes(keyword);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <StudentAppLayout eyebrow="Smart Financial" title="Portal Beasiswa">
      <main className="mx-auto max-w-6xl px-5 py-6 lg:px-7">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to="/app/programs/smart-financial"><ArrowLeft className="size-4" /> Kembali ke Smart Financial</Link>
        <section className="mt-5 rounded-lg bg-[#101b3f] p-6 text-white">
          <p className="text-sm text-white/60">Kelas XII</p>
          <h1 className="mt-2 text-3xl font-semibold">Portal Beasiswa</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Gunakan halaman ini untuk mulai mengecek opsi bantuan biaya. Selalu cek syarat dan tanggal resmi dari tautan penyelenggara.</p>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-amber-500" onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, penyelenggara, atau kecocokan..." value={query} />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {filters.map((item) => <button className={`h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold ${filter === item ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((item) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5" key={item.name}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-amber-700">{item.type}</p>
                  <h2 className="mt-1 font-semibold text-[#101b3f]">{item.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{item.provider}</p>
                </div>
                <a className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700" href={item.url} rel="noreferrer" target="_blank">Resmi <ExternalLink className="size-3.5" /></a>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{item.fit.map((fit) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={fit}>{fit}</span>)}</div>
            </article>
          ))}
        </section>
      </main>
    </StudentAppLayout>
  );
}
