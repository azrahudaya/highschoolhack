import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

export function NotFoundPage() {
  return (
    <PublicLayout>
      <main className="grid min-h-[60vh] place-items-center bg-white px-6 py-16">
        <section className="max-w-xl text-center">
          <SearchX className="mx-auto size-10 text-violet-700" />
          <h1 className="mt-5 text-4xl font-semibold text-[#101b3f]">Halaman tidak ditemukan</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">Alamat yang dibuka tidak tersedia atau sudah berubah.</p>
          <Link className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#101b3f] px-5 py-3 text-sm font-semibold text-white" to="/">
            <ArrowLeft className="size-4" /> Kembali ke Beranda
          </Link>
        </section>
      </main>
    </PublicLayout>
  );
}
