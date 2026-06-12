import { ArrowLeft, ArrowUpRight, BookOpenText } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { articles } from '../data/content';

export function ArticleDetailPage() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return <Navigate to="/articles" replace />;

  return (
    <PublicLayout>
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-14">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to="/articles"><ArrowLeft className="size-4" /> Kembali ke artikel</Link>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.08em] text-[#5b21b6]">{article.category} · {article.readTime}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#101b3f] sm:text-5xl">{article.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{article.summary}</p>
          <div className="my-10 h-px bg-slate-200" />
          <div className="prose-copy">
            <h2>Mulai dari keputusan yang ingin dibuat</h2>
            <p>Informasi akan lebih berguna ketika kamu tahu keputusan apa yang sedang dipersiapkan. Catat pertanyaan, pilihan yang tersedia, serta hal yang masih belum kamu pahami.</p>
            <h2>Hubungkan dengan kondisi dirimu</h2>
            <p>Jangan hanya mengikuti pilihan populer. Pertimbangkan minat, kemampuan, dukungan yang tersedia, dan tujuan jangka panjangmu.</p>
            <h2>Diskusikan dan evaluasi</h2>
            <p>Bawa hasil bacaan ke diskusi bersama orang tua, Guru BK, atau orang yang memahami bidang tersebut. Perbarui rencanamu ketika menemukan informasi yang lebih kuat.</p>
          </div>
          <a className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[#15224a] px-5 py-3 text-sm font-semibold text-white" href={article.sourceUrl} rel="noreferrer" target="_blank">
            <BookOpenText className="size-4" /> Baca sumber: {article.source} <ArrowUpRight className="size-4" />
          </a>
        </article>
      </main>
    </PublicLayout>
  );
}
