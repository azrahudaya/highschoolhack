export type Program = {
  slug: string;
  title: string;
  shortTitle: string;
  grade: string;
  phase: string;
  eyebrow: string;
  description: string;
  theme: string;
  accent: string;
  modules: string[];
  outcomes: string[];
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  source: string;
  sourceUrl: string;
};

export const programs: Program[] = [
  {
    slug: 'bekal-10',
    title: 'Bekal 10',
    shortTitle: 'Mulai dengan kuat',
    grade: 'Kelas X',
    phase: 'Program pertama',
    eyebrow: 'Adaptasi dan potensi diri',
    description:
      'Membantu siswa beradaptasi di SMA, mengenali potensi, menetapkan target akademik, dan membangun portofolio perkembangan.',
    theme: 'Dari langkah pertama menuju versi terbaik dirimu.',
    accent: '#5b21b6',
    modules: [
      'Langkah Awalku di SMA',
      'Mengenal Diriku Lebih Dekat',
      'Vision Board SMA-ku',
      'Target Pengembangan Diri',
      'Belajar dari Perjalanan',
      'Merancang Target Prestasi',
      'Komitmen Akademikku',
    ],
    outcomes: ['Profil adaptasi', 'Hasil minat dan gaya belajar', 'Vision board', 'Portofolio perkembangan'],
  },
  {
    slug: 'setting-goal',
    title: 'Setting Goal',
    shortTitle: 'Tentukan arah',
    grade: 'Kelas XI',
    phase: 'Program kedua',
    eyebrow: 'Studi, karier, dan rencana aksi',
    description:
      'Membantu siswa mengeksplorasi program studi dan karier, menyusun tujuan masa depan, serta memantau rencana aksi.',
    theme: 'Dari mengenal diri menuju masa depan yang terarah.',
    accent: '#087f5b',
    modules: [
      'Kenali Diriku',
      'Eksplorasi Program Studi',
      'Eksplorasi Karier',
      'Mata Pelajaran Pendukung',
      'Goal Setting',
      'Rencana Aksi',
      'Dashboard Perkembangan',
      'Refleksi',
    ],
    outcomes: ['Pilihan program studi', 'Pilihan karier', 'SMART goals', 'Kalender rencana aksi'],
  },
  {
    slug: 'smart-financial',
    title: 'Smart Financial',
    shortTitle: 'Siap setelah lulus',
    grade: 'Kelas XII',
    phase: 'Program ketiga',
    eyebrow: 'Kesiapan hidup dan finansial',
    description:
      'Membantu siswa mempersiapkan kehidupan setelah lulus melalui simulasi biaya hidup, beasiswa, dan financial readiness score.',
    theme: 'Latih keputusan hari ini untuk hidup mandiri nanti.',
    accent: '#b45309',
    modules: ['Identitas dan target setelah lulus', 'Pilih kota tujuan', 'Simulasi finansial', 'Hasil dan rekomendasi'],
    outcomes: ['Financial readiness score', 'Analisis keputusan', 'Referensi beasiswa', 'Rencana kesiapan pribadi'],
  },
];

export const articles: Article[] = [
  {
    slug: 'menentukan-jurusan-kuliah',
    title: '5 Cara Menentukan Jurusan Kuliah yang Tepat',
    category: 'Kuliah',
    readTime: '6 menit',
    summary: 'Mulai dari minat, kemampuan, gaya belajar, sampai gambaran pekerjaan yang ingin kamu jalani.',
    source: 'Teknokrat',
    sourceUrl: 'https://daftarsekolah.spmb.teknokrat.ac.id/2026/02/10-tips-memilih-jurusan-kuliah-yang-tepat-untuk-lulusan-sma/',
  },
  {
    slug: 'tips-belajar-efektif',
    title: 'Tips Belajar Efektif untuk Siswa SMA',
    category: 'Pendidikan',
    readTime: '5 menit',
    summary: 'Bangun sistem belajar realistis dengan target yang jelas, latihan soal, dan evaluasi berkala.',
    source: 'SMA Dwiwarna',
    sourceUrl: 'https://www.smadwiwarna.sch.id/tips-belajar-efektif/',
  },
  {
    slug: 'skill-masa-depan',
    title: 'Skill Masa Depan yang Relevan di Era AI',
    category: 'Karier',
    readTime: '7 menit',
    summary: 'Kenali kemampuan digital, analytical thinking, dan keterampilan interpersonal yang semakin penting.',
    source: 'Universitas Ciputra',
    sourceUrl: 'https://jakarta.ciputra.ac.id/10-skill-masa-depan-yang-wajib-dimiliki-mahasiswa/',
  },
  {
    slug: 'menabung-untuk-pelajar',
    title: 'Cara Memulai Kebiasaan Menabung untuk Pelajar',
    category: 'Finansial',
    readTime: '4 menit',
    summary: 'Langkah sederhana untuk membuat target tabungan dan mengelola uang saku dengan lebih sadar.',
    source: 'Bizhare',
    sourceUrl: 'https://www.bizhare.id/media/keuangan/tips-menabung-untuk-pelajar',
  },
  {
    slug: 'memahami-gap-year',
    title: 'Apa Itu Gap Year dan Bagaimana Menjalaninya?',
    category: 'Kuliah',
    readTime: '6 menit',
    summary: 'Gap year bisa menjadi masa persiapan yang produktif ketika memiliki tujuan dan rencana yang terukur.',
    source: 'Cakrawala',
    sourceUrl: 'https://www.cakrawala.ac.id/blog/gap-year-adalah',
  },
  {
    slug: 'membuat-cv-pertama',
    title: 'Panduan Membuat CV Pertama untuk Lulusan SMA',
    category: 'Karier',
    readTime: '5 menit',
    summary: 'Susun pengalaman organisasi, proyek, keterampilan, dan pencapaian menjadi CV yang mudah dipahami.',
    source: 'Jobstreet',
    sourceUrl: 'https://id.jobstreet.com/id/career-advice/article/contoh-cv-fresh-graduate-sma-tips-membuat',
  },
];
