import { Bot, Database, LockKeyhole, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Data siswa dibatasi',
    text: 'HighschoolHack hanya meminta data yang diperlukan untuk akun, onboarding, progres program, portfolio, dan pendampingan Guru BK.',
  },
  {
    icon: LockKeyhole,
    title: 'Akun dan akses berbasis peran',
    text: 'Siswa, Guru BK, admin sekolah, dan super admin memiliki akses berbeda. Data sekolah tidak dimaksudkan untuk dibuka lintas sekolah tanpa izin.',
  },
  {
    icon: Bot,
    title: 'Chatbot memakai AI pihak ketiga',
    text: 'Jika chatbot AI aktif, pertanyaan umum siswa dapat dikirim ke DeepSeek melalui server HighschoolHack. Jangan menulis NISN, email, nomor telepon, alamat, atau data pribadi di chatbot.',
  },
  {
    icon: Database,
    title: 'Percakapan chatbot tidak disimpan',
    text: 'Pada MVP ini, HighschoolHack tidak menyimpan isi percakapan chatbot ke database. Jawaban modul dan portfolio tetap tersimpan agar progres program dapat dilanjutkan.',
  },
];

export function PrivacyPage() {
  return (
    <PublicLayout>
      <main>
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
            <p className="section-label">Privasi dan AI</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#101b3f] md:text-5xl">Cara HighschoolHack menjaga data siswa</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Halaman ini menjelaskan kebijakan MVP untuk penggunaan data, akses sekolah, dan chatbot AI. Untuk pilot sekolah, kebijakan ini perlu disetujui bersama pihak sekolah sebelum siswa mulai memakai platform.
            </p>
          </div>
        </section>

        <section className="bg-[#f7f9fc]">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-2">
            {principles.map(({ icon: Icon, text, title }) => (
              <article className="rounded-lg border border-slate-200 bg-white p-5" key={title}>
                <span className="grid size-10 place-items-center rounded-lg bg-violet-50 text-violet-700"><Icon className="size-5" /></span>
                <h2 className="mt-4 font-semibold text-[#101b3f]">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#101b3f]">Batasan chatbot</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>Chatbot hanya untuk Q&A umum tentang adaptasi SMA, potensi diri, gaya belajar, target pengembangan, motivasi belajar, perencanaan akademik, dan kebiasaan finansial dasar.</p>
              <p>Chatbot bukan pengganti Guru BK, psikolog, dokter, penasihat hukum, penasihat keuangan profesional, atau layanan darurat. Jika siswa mengalami kondisi berat, siswa harus menghubungi Guru BK, orang tua/wali, atau bantuan darurat setempat.</p>
              <p>Guru BK dan admin sekolah tetap menjadi pihak utama untuk konteks personal siswa. Chatbot tidak boleh dipakai untuk mengambil keputusan final tentang jurusan, karier, kesehatan mental, atau keuangan siswa.</p>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
