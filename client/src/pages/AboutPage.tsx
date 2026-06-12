import { Compass, Eye, School, ShieldCheck, UsersRound } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';

export function AboutPage() {
  return (
    <PublicLayout>
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="section-label">Tentang HighschoolHack</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-[#101b3f] sm:text-5xl">Membantu siswa melihat masa depan sebagai perjalanan yang bisa direncanakan.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">HighschoolHack hadir karena banyak siswa SMA masih menghadapi keputusan penting tanpa ruang refleksi dan data perkembangan yang terstruktur.</p>
          </div>
        </section>
        <section className="bg-[#f1f5ff] py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-7"><Eye className="size-6 text-[#5b21b6]" /><h2 className="mt-5 text-2xl font-semibold text-[#101b3f]">Visi</h2><p className="mt-3 leading-7 text-slate-600">Menjadi platform pendamping siswa SMA Indonesia dalam mengenali potensi, merencanakan masa depan, dan mencapai tujuan hidupnya.</p></div>
            <div className="rounded-lg border border-slate-200 bg-white p-7"><Compass className="size-6 text-[#087f5b]" /><h2 className="mt-5 text-2xl font-semibold text-[#101b3f]">Misi</h2><p className="mt-3 leading-7 text-slate-600">Membantu siswa mengenali diri, membangun rencana masa depan, dan meningkatkan literasi finansial melalui pendampingan sekolah.</p></div>
          </div>
        </section>
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="section-label">Prinsip produk</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[[UsersRound, 'Berpusat pada siswa', 'Setiap modul membantu siswa memahami dirinya sebelum mengambil keputusan.'], [School, 'Memperkuat Guru BK', 'Data dirancang untuk mendukung pendampingan, bukan menggantikan peran manusia.'], [ShieldCheck, 'Privasi sejak awal', 'Data sekolah dipisahkan dan akses dibatasi berdasarkan role.']].map(([Icon, title, body]) => (
                <div className="border-t-2 border-[#15224a] pt-5" key={String(title)}><Icon className="size-5 text-[#5b21b6]" /><h2 className="mt-4 text-lg font-semibold text-[#101b3f]">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p></div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
