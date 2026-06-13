export type ProgramStatus = 'available' | 'coming_soon';

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
  ctaLabel: string;
  detailHeadline: string;
  status: ProgramStatus;
  visualSignals: string[];
  modules: string[];
  outcomes: string[];
};

export type ArticleSection = {
  heading: string;
  paragraphs?: string[];
  points?: string[];
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  source: string;
  sourceUrl: string;
  sourceNote: string;
  accent: string;
  sections: ArticleSection[];
  reflectionQuestion: string;
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
    ctaLabel: 'Jelajahi Bekal 10',
    detailHeadline: 'Kenali Dirimu, Mulai Langkahmu, Wujudkan Versi Terbaik Dirimu',
    status: 'available',
    visualSignals: ['Peta adaptasi', 'Asesmen diri', 'Target akademik', 'Portofolio'],
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
    ctaLabel: 'Atur Goal-mu',
    detailHeadline: 'Rancang pilihan jurusan, karier, dan langkah nyata sejak kelas XI',
    status: 'available',
    visualSignals: ['Eksplorasi jurusan', 'SMART goals', 'Rencana aksi', 'Dashboard target'],
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
    ctaLabel: 'Kelola Finansial',
    detailHeadline: 'Siapkan keputusan hidup setelah lulus dengan simulasi yang realistis',
    status: 'available',
    visualSignals: ['Biaya hidup', 'Simulasi kota', 'Dana darurat', 'Beasiswa'],
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
    source: 'BINUS Online',
    sourceUrl: 'https://online.binus.ac.id/2021/11/24/ini-kiat-memilih-jurusan-kuliah-yang-tepat/',
    sourceNote: 'Gunakan sumber kampus dan laman resmi penerimaan mahasiswa sebagai pembanding sebelum mengambil keputusan.',
    accent: '#5b21b6',
    sections: [
      {
        heading: 'Mulai dari diri sendiri',
        paragraphs: [
          'Jurusan yang tepat bukan hanya jurusan yang sedang populer. Pilihan yang sehat biasanya bertemu di antara minat, kemampuan, nilai yang kamu anggap penting, dan kesiapan untuk menjalani proses belajarnya.',
        ],
      },
      {
        heading: 'Langkah praktis',
        points: [
          'Tuliskan mata pelajaran dan aktivitas yang membuatmu tahan belajar lebih lama.',
          'Bandingkan isi kurikulum jurusan, bukan hanya nama jurusannya.',
          'Cari tahu contoh pekerjaan, proyek, dan skill yang sering dipakai lulusan jurusan itu.',
          'Diskusikan pilihanmu dengan Guru BK, orang tua, alumni, atau mahasiswa aktif.',
          'Buat dua pilihan cadangan agar rencanamu tetap fleksibel.',
        ],
      },
      {
        heading: 'Cara mengecek kecocokan',
        paragraphs: [
          'Coba ikuti kelas pengantar gratis, baca silabus, atau kerjakan proyek kecil yang mirip dengan bidang tersebut. Dari situ kamu bisa melihat apakah rasa penasaranmu bertahan setelah tahu proses belajarnya.',
        ],
      },
    ],
    reflectionQuestion: 'Jurusan apa yang paling sering kamu pikirkan, dan bukti apa yang menunjukkan jurusan itu cocok untukmu?',
  },
  {
    slug: 'tips-belajar-efektif',
    title: 'Tips Belajar Efektif untuk Siswa SMA',
    category: 'Pendidikan',
    readTime: '5 menit',
    summary: 'Bangun sistem belajar realistis dengan target yang jelas, latihan soal, dan evaluasi berkala.',
    source: 'SMA Dwiwarna',
    sourceUrl: 'https://www.smadwiwarna.sch.id/tips-belajar-efektif/',
    sourceNote: 'Sesuaikan teknik belajar dengan jadwal sekolah, kondisi rumah, dan jenis mata pelajaran.',
    accent: '#2563eb',
    sections: [
      {
        heading: 'Belajar efektif dimulai dari sistem',
        paragraphs: [
          'Siswa sering mengira belajar efektif berarti belajar lebih lama. Dalam praktiknya, belajar efektif lebih dekat dengan rutinitas yang jelas, latihan yang tepat, dan evaluasi kecil yang dilakukan konsisten.',
        ],
      },
      {
        heading: 'Langkah praktis',
        points: [
          'Pecah target besar menjadi sesi 25 sampai 45 menit.',
          'Mulai dari materi yang paling sering keluar atau paling belum kamu pahami.',
          'Gunakan latihan soal untuk menguji pemahaman, bukan hanya membaca ulang.',
          'Buat rangkuman aktif dengan pertanyaan dan contoh, bukan menyalin buku.',
          'Sisihkan waktu evaluasi mingguan untuk melihat materi yang perlu diulang.',
        ],
      },
      {
        heading: 'Jaga energi belajar',
        paragraphs: [
          'Jadwal yang terlalu padat biasanya sulit bertahan. Sisipkan istirahat, tidur cukup, dan batas waktu layar agar tubuhmu tetap kuat mengikuti ritme SMA.',
        ],
      },
    ],
    reflectionQuestion: 'Kebiasaan belajar apa yang paling perlu kamu ubah minggu ini?',
  },
  {
    slug: 'skill-masa-depan',
    title: 'Skill Masa Depan yang Relevan di Era AI',
    category: 'Karier',
    readTime: '7 menit',
    summary: 'Kenali kemampuan digital, analytical thinking, dan keterampilan interpersonal yang semakin penting.',
    source: 'World Economic Forum',
    sourceUrl: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    sourceNote: 'Tren pekerjaan berubah cepat. Gunakan artikel ini sebagai peta awal, lalu terus cek kebutuhan bidang yang kamu minati.',
    accent: '#7c3aed',
    sections: [
      {
        heading: 'AI membuat skill dasar makin penting',
        paragraphs: [
          'Era AI bukan hanya tentang bisa memakai alat digital. Siswa juga perlu belajar berpikir jernih, membaca data, bekerja sama, dan menjelaskan ide dengan bahasa yang mudah dipahami.',
        ],
      },
      {
        heading: 'Skill yang bisa mulai dilatih dari SMA',
        points: [
          'Literasi digital: paham cara kerja alat, data, privasi, dan keamanan dasar.',
          'Analytical thinking: mampu memecah masalah dan membaca pola.',
          'Komunikasi: bisa menulis, presentasi, dan mendengar dengan baik.',
          'Kolaborasi: terbiasa bekerja dalam tim dan memberi umpan balik.',
          'Adaptabilitas: mau belajar ulang ketika kebutuhan berubah.',
        ],
      },
      {
        heading: 'Mulai dari proyek kecil',
        paragraphs: [
          'Kamu bisa melatih skill masa depan lewat proyek sekolah, organisasi, lomba, karya digital, atau kegiatan sosial. Yang penting, simpan bukti proses dan hasilnya sebagai portofolio.',
        ],
      },
    ],
    reflectionQuestion: 'Satu skill apa yang ingin kamu latih selama 30 hari ke depan, dan proyek kecil apa yang bisa membuktikannya?',
  },
  {
    slug: 'menabung-untuk-pelajar',
    title: 'Cara Memulai Kebiasaan Menabung untuk Pelajar',
    category: 'Finansial',
    readTime: '4 menit',
    summary: 'Langkah sederhana untuk membuat target tabungan dan mengelola uang saku dengan lebih sadar.',
    source: 'Otoritas Jasa Keuangan',
    sourceUrl: 'https://ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Pages/Hari-Indonesia-Menabung-dan-Bulan-Literasi-Keuangan-2025.aspx',
    sourceNote: 'Gunakan prinsip literasi keuangan dasar dan diskusikan keputusan finansial besar dengan orang tua atau wali.',
    accent: '#b45309',
    sections: [
      {
        heading: 'Menabung adalah latihan mengambil keputusan',
        paragraphs: [
          'Bagi pelajar, menabung bukan sekadar menyisihkan uang. Ini adalah latihan membedakan kebutuhan, keinginan, dan target yang lebih penting dalam jangka panjang.',
        ],
      },
      {
        heading: 'Langkah praktis',
        points: [
          'Tentukan target tabungan yang jelas, misalnya buku, kursus, lomba, atau dana darurat kecil.',
          'Pisahkan uang tabungan segera setelah menerima uang saku.',
          'Catat pengeluaran harian selama satu minggu untuk melihat pola.',
          'Gunakan aturan sederhana seperti 70 persen kebutuhan, 20 persen tabungan, 10 persen berbagi atau hiburan.',
          'Evaluasi target setiap akhir bulan.',
        ],
      },
      {
        heading: 'Jangan mengejar gaya hidup orang lain',
        paragraphs: [
          'Kondisi setiap keluarga berbeda. Ukuran berhasil bukan jumlah tabungan yang sama dengan teman, tetapi konsistensi dan kemampuan membuat keputusan yang lebih sadar.',
        ],
      },
    ],
    reflectionQuestion: 'Pengeluaran kecil apa yang paling sering membuat uang sakumu cepat habis?',
  },
  {
    slug: 'memahami-gap-year',
    title: 'Apa Itu Gap Year dan Bagaimana Menjalaninya?',
    category: 'Kuliah',
    readTime: '6 menit',
    summary: 'Gap year bisa menjadi masa persiapan yang produktif ketika memiliki tujuan dan rencana yang terukur.',
    source: 'Cakrawala',
    sourceUrl: 'https://www.cakrawala.ac.id/blog/gap-year-adalah',
    sourceNote: 'Pastikan rencana gap year dibicarakan dengan keluarga dan memiliki target yang bisa dievaluasi.',
    accent: '#0f766e',
    sections: [
      {
        heading: 'Gap year perlu rencana, bukan sekadar jeda',
        paragraphs: [
          'Gap year dapat membantu siswa memperkuat persiapan kuliah, kemampuan bahasa, pengalaman kerja, atau portofolio. Namun tanpa rencana, waktu satu tahun bisa berlalu tanpa perkembangan yang jelas.',
        ],
      },
      {
        heading: 'Langkah praktis',
        points: [
          'Tentukan alasan utama mengambil gap year.',
          'Buat target bulanan seperti belajar UTBK, kursus, magang, atau proyek portofolio.',
          'Tetapkan jadwal harian agar ritme belajar tidak hilang.',
          'Simpan bukti kegiatan, sertifikat, karya, dan refleksi.',
          'Evaluasi rencana bersama keluarga atau mentor setiap bulan.',
        ],
      },
      {
        heading: 'Tanda gap year berjalan sehat',
        paragraphs: [
          'Gap year yang sehat membuatmu punya kemampuan, pemahaman diri, atau kesiapan yang lebih baik dibanding saat mulai. Jika justru membuatmu makin bingung, cari bantuan diskusi lebih awal.',
        ],
      },
    ],
    reflectionQuestion: 'Jika kamu mengambil gap year, tiga hasil konkret apa yang harus sudah terlihat dalam enam bulan pertama?',
  },
  {
    slug: 'membuat-cv-pertama',
    title: 'Panduan Membuat CV Pertama untuk Lulusan SMA',
    category: 'Karier',
    readTime: '5 menit',
    summary: 'Susun pengalaman organisasi, proyek, keterampilan, dan pencapaian menjadi CV yang mudah dipahami.',
    source: 'Jobstreet',
    sourceUrl: 'https://id.jobstreet.com/id/career-advice/article/contoh-cv-fresh-graduate-sma-tips-membuat',
    sourceNote: 'CV pertama tidak harus panjang. Utamakan kejelasan, bukti, dan relevansi dengan tujuan.',
    accent: '#0891b2',
    sections: [
      {
        heading: 'CV pertama adalah rangkuman bukti',
        paragraphs: [
          'Lulusan SMA sering merasa belum punya pengalaman. Padahal organisasi, lomba, proyek kelas, kegiatan sosial, dan karya pribadi bisa menjadi bukti kemampuan jika ditulis dengan jelas.',
        ],
      },
      {
        heading: 'Langkah praktis',
        points: [
          'Mulai dengan profil singkat dua sampai tiga kalimat.',
          'Tulis pendidikan, organisasi, proyek, lomba, dan pengalaman sukarela.',
          'Gunakan angka jika ada, misalnya jumlah peserta acara atau target yang dicapai.',
          'Pisahkan skill teknis dan skill interpersonal.',
          'Simpan CV dalam format PDF dengan nama file yang rapi.',
        ],
      },
      {
        heading: 'Hindari isi yang terlalu umum',
        paragraphs: [
          'Kalimat seperti pekerja keras atau mudah beradaptasi perlu bukti. Ganti dengan contoh pengalaman yang menunjukkan kemampuan tersebut.',
        ],
      },
    ],
    reflectionQuestion: 'Pengalaman sekolah mana yang paling layak kamu masukkan ke CV pertamamu?',
  },
  {
    slug: 'beasiswa-untuk-siswa-sma',
    title: '10 Beasiswa untuk Siswa SMA yang Perlu Kamu Pantau',
    category: 'Pendidikan',
    readTime: '7 menit',
    summary: 'Kenali jenis beasiswa dan cara menyiapkan dokumen sejak SMA agar tidak terburu-buru saat pendaftaran dibuka.',
    source: 'Pusat Prestasi Nasional',
    sourceUrl: 'https://pusatprestasinasional.kemdikbud.go.id/',
    sourceNote: 'Informasi beasiswa selalu berubah. Cek ulang jadwal, syarat, dan tautan resmi sebelum mendaftar.',
    accent: '#ca8a04',
    sections: [
      {
        heading: 'Pantau jenis beasiswa, bukan hanya namanya',
        paragraphs: [
          'Beasiswa untuk siswa SMA bisa berbentuk dukungan prestasi, kompetisi, persiapan studi lanjut, pertukaran, bantuan biaya, atau program talenta. Karena jadwalnya berubah, yang paling penting adalah tahu cara memantau dan menyiapkan diri.',
        ],
      },
      {
        heading: 'Daftar peluang yang layak dipantau',
        points: [
          'Program prestasi dan talenta dari lembaga pemerintah.',
          'Beasiswa dari kampus untuk calon mahasiswa baru.',
          'Beasiswa yayasan pendidikan atau lembaga sosial.',
          'Kompetisi akademik yang memberi pembinaan atau bantuan studi.',
          'Program pertukaran pelajar.',
          'Beasiswa berbasis karya, riset, atau inovasi.',
          'Dukungan pendidikan dari pemerintah daerah.',
          'Program CSR perusahaan.',
          'Beasiswa pesantren, sekolah, atau komunitas.',
          'Program persiapan studi luar negeri yang resmi.',
        ],
      },
      {
        heading: 'Dokumen yang bisa disiapkan lebih awal',
        points: [
          'Rapor dan sertifikat prestasi.',
          'Esai motivasi versi pendek dan panjang.',
          'CV pelajar atau portofolio kegiatan.',
          'Surat rekomendasi dari guru atau pembina.',
          'Scan identitas dan dokumen keluarga jika dibutuhkan.',
        ],
      },
    ],
    reflectionQuestion: 'Beasiswa seperti apa yang paling sesuai dengan kekuatanmu saat ini: prestasi akademik, organisasi, karya, atau kebutuhan biaya?',
  },
  {
    slug: 'kisah-inspiratif-pelajar-sukses',
    title: 'Kisah Inspiratif Pelajar Sukses: Pola yang Bisa Kamu Tiru',
    category: 'Inspirasi',
    readTime: '6 menit',
    summary: 'Cerita sukses pelajar biasanya punya pola: konsisten, mencari dukungan, dan berani mulai dari langkah kecil.',
    source: 'Puslapdik Kemendikdasmen',
    sourceUrl: 'https://puslapdik.kemendikdasmen.go.id/kisah-athi-masuk-smp-sampai-s2-tanpa-seleksi-tapi-melalui-prestasi/',
    sourceNote: 'Gunakan kisah inspiratif sebagai bahan refleksi, bukan bahan membandingkan diri secara tidak sehat.',
    accent: '#db2777',
    sections: [
      {
        heading: 'Inspirasi yang sehat tidak membuatmu minder',
        paragraphs: [
          'Kisah sukses pelajar sering terlihat seperti hasil akhir yang tiba-tiba. Padahal di baliknya ada kebiasaan kecil, dukungan orang sekitar, kegagalan, dan keputusan untuk mencoba lagi.',
        ],
      },
      {
        heading: 'Pola yang sering muncul',
        points: [
          'Memiliki satu target yang cukup jelas untuk dikejar.',
          'Mencari guru, teman, keluarga, atau komunitas yang mendukung.',
          'Mencatat progres agar tahu bagian yang perlu diperbaiki.',
          'Berani mengikuti lomba, proyek, atau kesempatan meski belum sempurna.',
          'Tidak menjadikan kegagalan pertama sebagai akhir perjalanan.',
        ],
      },
      {
        heading: 'Ubah inspirasi menjadi aksi',
        paragraphs: [
          'Setelah membaca kisah inspiratif, pilih satu kebiasaan yang bisa kamu tiru minggu ini. Jangan menunggu motivasi besar. Mulai dari tindakan kecil yang bisa dilakukan hari ini.',
        ],
      },
    ],
    reflectionQuestion: 'Kebiasaan kecil apa dari orang yang kamu kagumi yang bisa kamu tiru mulai minggu ini?',
  },
];
