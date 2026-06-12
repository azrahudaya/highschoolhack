import { ArrowLeft, LoaderCircle, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PortfolioDocument } from '../components/PortfolioDocument';
import { TeacherAppLayout } from '../components/TeacherAppLayout';
import { api } from '../lib/api';
import type { Bekal10Portfolio } from '../types/bekal10';

export function TeacherStudentDetailPage() {
  const { userId = '' } = useParams();
  const [portfolio, setPortfolio] = useState<Bekal10Portfolio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Bekal10Portfolio>(`/api/teacher/bekal-10/students/${userId}`).then(setPortfolio).catch((requestError: Error) => setError(requestError.message));
  }, [userId]);

  return <TeacherAppLayout title={portfolio?.student.name ?? 'Detail siswa'}>
    <div className="no-print mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-7"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to="/teacher"><ArrowLeft className="size-4" />Kembali ke monitoring</Link><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" disabled={!portfolio} onClick={() => window.print()} type="button"><Printer className="size-4" />Cetak / Simpan PDF</button></div>
    {error && <p className="mx-auto max-w-5xl rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!portfolio && !error && <div className="grid min-h-80 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}
    {portfolio && <div className="px-0 pb-8 md:px-5"><PortfolioDocument portfolio={portfolio} /></div>}
  </TeacherAppLayout>;
}
