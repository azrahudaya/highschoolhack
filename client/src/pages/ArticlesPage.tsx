import { ArrowUpRight, Bookmark, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { articles } from '../data/content';

export function ArticlesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const preferredOrder = ['Pendidikan', 'Karier', 'Kuliah', 'Finansial', 'Inspirasi'];
  const categories = ['Semua', ...preferredOrder.filter((item) => articles.some((article) => article.category === item))];
  const filtered = useMemo(
    () => articles.filter((article) => (category === 'Semua' || article.category === category) && `${article.title} ${article.summary}`.toLowerCase().includes(query.toLowerCase())),
    [category, query],
  );

  return (
    <PublicLayout>
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <p className="section-label">Pusat wawasan siswa</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-[#101b3f] sm:text-5xl">Bacaan untuk belajar, memilih, dan mempersiapkan diri.</h1>
            <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-lg border border-slate-300 bg-white px-4">
              <Search className="size-5 text-slate-400" />
              <input className="min-w-0 flex-1 py-3 outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Cari artikel..." value={query} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button className={`rounded-full px-4 py-2 text-sm font-medium ${category === item ? 'bg-[#15224a] text-white' : 'border border-slate-200 bg-white text-slate-600'}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <article className="flex min-h-80 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white" key={article.slug}>
                <div className="flex min-h-24 items-end p-5 text-white" style={{ background: `linear-gradient(135deg, ${article.accent}, #101b3f)` }}>
                  <Bookmark className="size-6" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between text-xs"><span className="font-semibold uppercase tracking-[0.08em]" style={{ color: article.accent }}>{article.category}</span><span className="text-slate-400">{article.readTime}</span></div>
                <h2 className="mt-5 text-xl font-semibold text-[#101b3f]">{article.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{article.summary}</p>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#15224a]" to={`/articles/${article.slug}`}>Baca ringkasan <ArrowUpRight className="size-4" /></Link>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Tidak ada artikel sesuai pencarian.</div>}
        </section>
      </main>
    </PublicLayout>
  );
}
