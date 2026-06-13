import { ArrowLeft, LoaderCircle, Plus, Printer } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PortfolioDocument } from '../components/PortfolioDocument';
import { TeacherAppLayout } from '../components/TeacherAppLayout';
import { api } from '../lib/api';
import type { Bekal10Portfolio } from '../types/bekal10';

type TeacherNote = {
  id: string;
  category: string;
  note: string;
  followUpAt: string | null;
  createdAt: string;
  teacherName: string;
};

export function TeacherStudentDetailPage() {
  const { userId = '' } = useParams();
  const [portfolio, setPortfolio] = useState<Bekal10Portfolio | null>(null);
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [category, setCategory] = useState('intervensi');
  const [note, setNote] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Bekal10Portfolio>(`/api/teacher/bekal-10/students/${userId}`).then(setPortfolio).catch((requestError: Error) => setError(requestError.message));
    api<{ notes: TeacherNote[] }>(`/api/teacher/bekal-10/students/${userId}/notes`).then((response) => setNotes(response.notes)).catch(() => undefined);
  }, [userId]);

  async function addNote(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await api(`/api/teacher/bekal-10/students/${userId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          category,
          note,
          followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined,
        }),
      });
      setNote('');
      setFollowUpAt('');
      const response = await api<{ notes: TeacherNote[] }>(`/api/teacher/bekal-10/students/${userId}/notes`);
      setNotes(response.notes);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan catatan.');
    }
  }

  return <TeacherAppLayout title={portfolio?.student.name ?? 'Detail siswa'}>
    <div className="no-print mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-7"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" to="/teacher"><ArrowLeft className="size-4" />Kembali ke monitoring</Link><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" disabled={!portfolio} onClick={() => window.print()} type="button"><Printer className="size-4" />Cetak / Simpan PDF</button></div>
    {error && <p className="mx-auto max-w-5xl rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!portfolio && !error && <div className="grid min-h-80 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div>}
    {portfolio && <section className="no-print mx-auto mb-5 grid max-w-5xl gap-5 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-7">
      <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={addNote}>
        <h2 className="font-semibold text-[#101b3f]">Catatan Guru BK</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Gunakan untuk follow-up internal. Jangan tulis data sensitif yang tidak diperlukan.</p>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Kategori<select className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" onChange={(event) => setCategory(event.target.value)} value={category}><option value="intervensi">Intervensi</option><option value="follow-up">Follow-up</option><option value="apresiasi">Apresiasi</option><option value="orang-tua">Diskusi orang tua</option></select></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Catatan<textarea className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal leading-6 outline-none focus:border-violet-500" onChange={(event) => setNote(event.target.value)} required value={note} /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Tanggal follow-up<input className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal" onChange={(event) => setFollowUpAt(event.target.value)} type="datetime-local" value={followUpAt} /></label>
        <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" type="submit"><Plus className="size-4" />Simpan catatan</button>
      </form>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#101b3f]">Riwayat catatan</h2>
        <div className="mt-4 space-y-3">
          {notes.length ? notes.map((item) => <article className="rounded-lg border border-slate-200 p-4" key={item.id}><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">{item.category}</span><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.note}</p><p className="mt-3 text-xs text-slate-400">Oleh {item.teacherName}{item.followUpAt ? ` - Follow-up ${new Date(item.followUpAt).toLocaleString('id-ID')}` : ''}</p></article>) : <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">Belum ada catatan.</p>}
        </div>
      </div>
    </section>}
    {portfolio && <div className="px-0 pb-8 md:px-5"><PortfolioDocument portfolio={portfolio} /></div>}
  </TeacherAppLayout>;
}
