import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpenText, MessageCircleQuestion } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { articles } from '../data/content';

export function ArticleDetailPage() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return <Navigate to="/articles" replace />;

  const related = articles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 2);
  const fallbackRelated = related.length ? related : articles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <PublicLayout>
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-14">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to="/articles"><ArrowLeft className="size-4" /> Kembali ke artikel</Link>
          <div className="mt-10 rounded-lg p-6 text-white" style={{ background: `linear-gradient(135deg, ${article.accent}, #101b3f)` }}>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/75">{article.category} - {article.readTime}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{article.title}</h1>
            <p className="mt-6 text-lg leading-8 text-white/80">{article.summary}</p>
          </div>
          <div className="prose-copy mt-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.points && (
                  <ul>
                    {section.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="font-semibold text-amber-950">Pertanyaan refleksi</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">{article.reflectionQuestion}</p>
              </div>
            </div>
          </section>
          <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">{article.sourceNote}</p>
            <a className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#15224a] px-5 py-3 text-sm font-semibold text-white" href={article.sourceUrl} rel="noreferrer" target="_blank">
              <BookOpenText className="size-4" /> Baca sumber: {article.source} <ArrowUpRight className="size-4" />
            </a>
          </section>
        </article>

        <section className="border-t border-slate-200 bg-[#f7f9fc] py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-label">Artikel terkait</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#101b3f]">Lanjutkan eksplorasi</h2>
              </div>
              <Link className="hidden text-sm font-semibold text-[#5b21b6] sm:inline-flex" to="/articles">Semua artikel</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {fallbackRelated.map((item) => (
                <Link className="group rounded-lg border border-slate-200 bg-white p-5" key={item.slug} to={`/articles/${item.slug}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: item.accent }}>{item.category}</p>
                  <h3 className="mt-3 font-semibold text-[#101b3f] group-hover:text-[#5b21b6]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#15224a]">Baca artikel <ArrowRight className="size-4" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
