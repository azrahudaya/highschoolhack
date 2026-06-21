import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { scholarshipPortal } from '../data/smart-financial';

const filters = ['Semua', ...Array.from(new Set(scholarshipPortal.map((item) => item.type)))];
const statusFilters = ['Semua status', 'Sedang/Akan dibuka', 'Pantau berkala', 'Sudah lewat/ditutup'];
const levelFilters = ['Semua jenjang', 'S1', 'Vokasi/Diploma', 'Saat kuliah', 'Studi lanjut'];

function statusBucket(item: (typeof scholarshipPortal)[number]) {
  const text = `${item.status ?? ''} ${item.deadline ?? ''}`.toLowerCase();
  if (text.includes('sedang dibuka') || text.includes('akan dibuka')) return 'Sedang/Akan dibuka';
  if (text.includes('ditutup') || text.includes('sudah lewat') || text.includes('sudah berakhir')) return 'Sudah lewat/ditutup';
  return 'Pantau berkala';
}

function levelBucket(item: (typeof scholarshipPortal)[number]) {
  const text = `${item.fit.join(' ')} ${item.description}`.toLowerCase();
  if (text.includes('saat kuliah') || text.includes('mahasiswa')) return 'Saat kuliah';
  if (text.includes('studi lanjut') || text.includes('s2') || text.includes('s3')) return 'Studi lanjut';
  if (text.includes('vokasi') || text.includes('diploma')) return 'Vokasi/Diploma';
  return 'S1';
}

function sortScore(item: (typeof scholarshipPortal)[number]) {
  const bucket = statusBucket(item);
  if (bucket === 'Sedang/Akan dibuka') return 0;
  if (bucket === 'Pantau berkala') return 1;
  return 2;
}

export function ScholarshipPortalAppPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const [levelFilter, setLevelFilter] = useState('Semua jenjang');
  const [sort, setSort] = useState('Status');
  const visible = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    const filtered = scholarshipPortal.filter((item) => {
      const matchesFilter = filter === 'Semua' || item.type === filter;
      const matchesStatus = statusFilter === 'Semua status' || statusBucket(item) === statusFilter;
      const matchesLevel = levelFilter === 'Semua jenjang' || levelBucket(item) === levelFilter;
      const matchesQuery = !keyword || [item.name, item.provider, item.description, item.status, item.deadline, item.fit.join(' ')].join(' ').toLowerCase().includes(keyword);
      return matchesFilter && matchesStatus && matchesLevel && matchesQuery;
    });
    return filtered.sort((left, right) => {
      if (sort === 'A-Z') return left.name.localeCompare(right.name);
      if (sort === 'Terbaru dicek') return (right.lastVerified ?? '').localeCompare(left.lastVerified ?? '');
      return sortScore(left) - sortScore(right) || left.name.localeCompare(right.name);
    });
  }, [filter, levelFilter, query, sort, statusFilter]);

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
          <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-amber-500" onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, penyelenggara, atau kecocokan..." value={query} />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {filters.map((item) => <button className={`h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold ${filter === item ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label>
              <span className="mb-1 block text-xs font-semibold text-slate-500">Status</span>
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                {statusFilters.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-slate-500">Jenjang</span>
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500" onChange={(event) => setLevelFilter(event.target.value)} value={levelFilter}>
                {levelFilters.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-slate-500">Urutkan</span>
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500" onChange={(event) => setSort(event.target.value)} value={sort}>
                {['Status', 'A-Z', 'Terbaru dicek'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">{visible.length} dari {scholarshipPortal.length} beasiswa ditampilkan</p>
        </section>

        {visible.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="font-semibold text-[#101b3f]">Tidak ada beasiswa yang cocok</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Coba ubah kata kunci, status, jenjang, atau kategori supaya hasilnya lebih luas.</p>
            <button className="mt-4 h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700" onClick={() => { setQuery(''); setFilter('Semua'); setStatusFilter('Semua status'); setLevelFilter('Semua jenjang'); setSort('Status'); }} type="button">Reset filter</button>
          </section>
        ) : <section className="mt-6 grid gap-4 md:grid-cols-2">
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
              {(item.status || item.deadline) && (
                <div className="mt-4 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
                  {item.status && <p><span className="font-semibold text-slate-800">Status:</span> {item.status}</p>}
                  {item.deadline && <p><span className="font-semibold text-slate-800">Jadwal:</span> {item.deadline}</p>}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">{item.fit.map((fit) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={fit}>{fit}</span>)}</div>
              {item.lastVerified && <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">Terakhir dicek: {item.lastVerified}</p>}
            </article>
          ))}
        </section>}
      </main>
    </StudentAppLayout>
  );
}
