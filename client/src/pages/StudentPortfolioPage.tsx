import { LoaderCircle, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortfolioDocument } from '../components/PortfolioDocument';
import { StudentAppLayout } from '../components/StudentAppLayout';
import { api } from '../lib/api';
import type { Bekal10Portfolio } from '../types/bekal10';

export function StudentPortfolioPage() {
  const [searchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState<Bekal10Portfolio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Bekal10Portfolio>('/api/student/programs/bekal-10/portfolio').then(setPortfolio).catch((requestError: Error) => setError(requestError.message));
  }, []);

  return <StudentAppLayout eyebrow="Bekal 10" title="Portofolio perkembangan">
    {searchParams.get('completed') === 'bekal-10' && <div className="no-print mx-auto mt-5 max-w-5xl rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 lg:mx-7"><h1 className="text-lg font-semibold">Selamat, portofoliomu siap.</h1><p className="mt-1 text-sm leading-6 text-emerald-800">Kamu sudah menyelesaikan perjalanan Bekal 10. Cek ringkasanmu, lalu cetak atau simpan sebagai PDF jika diperlukan.</p></div>}
    <div className="no-print mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 lg:px-7"><div><h1 className="text-xl font-semibold text-[#101b3f]">Portofolio saya</h1><p className="mt-1 text-sm text-slate-500">Terbentuk otomatis dari modul yang sudah selesai.</p></div><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" disabled={!portfolio} onClick={() => window.print()} type="button"><Printer className="size-4" />Cetak / Simpan PDF</button></div>
    {error && <p className="mx-auto max-w-5xl rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!portfolio && !error && <div className="grid min-h-80 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}
    {portfolio && <div className="px-0 pb-8 md:px-5"><PortfolioDocument portfolio={portfolio} /></div>}
  </StudentAppLayout>;
}
