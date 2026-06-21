import type { RiasecCategory, VarkCategory } from '../types/bekal10';

export const excitementOptions = ['Pelajaran baru', 'Teman baru', 'Kegiatan sekolah', 'Guru baru', 'Lebih mandiri', 'Mencoba hal baru'];
export const challengeOptions = ['Mengatur waktu', 'Beradaptasi', 'Memahami pelajaran', 'Berani bertanya', 'Membangun pertemanan', 'Menjaga motivasi'];
export const improvementOptions = ['Disiplin belajar', 'Percaya diri', 'Komunikasi', 'Manajemen waktu', 'Kerja sama', 'Konsistensi'];
export const targetOptions = ['Mengenal lingkungan sekolah', 'Punya rutinitas belajar', 'Aktif di kelas', 'Menemukan kegiatan yang disukai', 'Menambah teman', 'Lebih berani mencoba'];
export const indoorStudyPlaces = ['Kelas', 'Perpustakaan', 'Ruang belajar rumah', 'Laboratorium', 'Ruang BK'];
export const outdoorStudyPlaces = ['Taman sekolah', 'Lapangan', 'Kantin saat diskusi', 'Kegiatan lapangan', 'Komunitas luar sekolah'];
export const relationLabels = ['Sangat sulit', 'Sulit', 'Cukup', 'Baik', 'Sangat baik'];
export const revisableSlugs = new Set(['vision-board-sma-ku', 'target-pengembangan-diri']);

export const categoryHex: Record<RiasecCategory | VarkCategory, string> = {
  R: '#f59e0b',
  I: '#3b82f6',
  A: '#d946ef',
  S: '#10b981',
  E: '#f97316',
  C: '#0891b2',
  V: '#3b82f6',
  K: '#f59e0b',
};

export const moduleDescriptions: Record<string, string> = {
  'langkah-awalku-di-sma': 'Petakan pengalaman awalmu dan tentukan langkah kecil untuk beradaptasi.',
  'mengenal-diriku-lebih-dekat': 'Kenali kecenderungan minat serta preferensi belajarmu melalui refleksi terarah.',
  'vision-board-sma-ku': 'Susun gambaran tujuan, kegiatan, dan harapanmu selama SMA.',
  'target-pengembangan-diri': 'Ubah area pengembangan pilihanmu menjadi SMART goal yang dapat dipantau.',
  'belajar-dari-perjalanan': 'Tarik kekuatan dan pelajaran dari pengalaman yang sudah kamu lalui.',
  'merancang-target-prestasi': 'Petakan prioritas pelajaran dan strategi untuk target akademik semester.',
  'komitmen-akademikku': 'Tutup perjalanan Bekal 10 dengan kontrak belajar yang konkret.',
};

export const riasecProfiles: Record<RiasecCategory, { summary: string; strengths: string; majors: string[]; careers: string[]; nextStep: string }> = {
  R: {
    summary: 'Realistic menunjukkan ketertarikan pada kegiatan praktik, alat, benda nyata, aktivitas lapangan, dan hasil yang bisa terlihat langsung.',
    strengths: 'Kuat di praktik langsung, observasi konkret, ketahanan kerja, dan menyelesaikan tugas yang punya bentuk nyata.',
    majors: ['Teknik', 'Vokasi/terapan', 'Arsitektur', 'Pertanian', 'Ilmu olahraga'],
    careers: ['Engineer', 'Teknisi', 'Arsitek', 'Desainer produk', 'Analis lapangan'],
    nextStep: 'Coba ikut proyek praktik, eksperimen, kegiatan lapangan, atau membuat karya fisik/digital sederhana.',
  },
  I: {
    summary: 'Investigative menunjukkan minat pada analisis, riset, eksperimen, data, dan mencari alasan di balik suatu masalah.',
    strengths: 'Kuat di berpikir kritis, membaca pola, bertanya mendalam, dan membandingkan bukti sebelum mengambil kesimpulan.',
    majors: ['Sains', 'Kedokteran', 'Informatika', 'Data science', 'Psikologi riset'],
    careers: ['Peneliti', 'Data analyst', 'Dokter', 'Analis laboratorium', 'Software engineer'],
    nextStep: 'Coba proyek riset kecil, membaca sumber tepercaya, eksperimen, atau diskusi berbasis data.',
  },
  A: {
    summary: 'Artistic menunjukkan minat pada ekspresi ide, desain, cerita, visual, musik, tulisan, dan cara baru menyelesaikan sesuatu.',
    strengths: 'Kuat di imajinasi, orisinalitas, komunikasi visual, bercerita, dan melihat kemungkinan yang belum terpikir orang lain.',
    majors: ['DKV', 'Desain produk', 'Seni', 'Sastra', 'Ilmu komunikasi'],
    careers: ['Desainer', 'Penulis', 'Content creator', 'Illustrator', 'Creative strategist'],
    nextStep: 'Coba membuat portofolio kecil berisi desain, tulisan, video, musik, presentasi, atau karya kreatif lain.',
  },
  S: {
    summary: 'Social menunjukkan minat membantu, mengajar, mendampingi, mendengarkan, dan membuat orang lain berkembang.',
    strengths: 'Kuat di empati, komunikasi, kerja kelompok, mentoring, dan membaca kebutuhan orang lain.',
    majors: ['Pendidikan', 'Psikologi', 'Kesehatan masyarakat', 'Keperawatan', 'Konseling'],
    careers: ['Guru', 'Konselor', 'HR', 'Pekerja sosial', 'Community officer'],
    nextStep: 'Coba menjadi tutor sebaya, terlibat komunitas, organisasi pelayanan, atau kegiatan mentoring.',
  },
  E: {
    summary: 'Enterprising menunjukkan minat memimpin, memengaruhi, menyusun strategi, bernegosiasi, dan menggerakkan orang.',
    strengths: 'Kuat di inisiatif, keberanian mengambil keputusan, presentasi, persuasi, dan membangun peluang.',
    majors: ['Manajemen', 'Bisnis', 'Ilmu komunikasi', 'Hukum', 'Hubungan internasional'],
    careers: ['Entrepreneur', 'Project manager', 'Marketing strategist', 'Sales lead', 'Public relations'],
    nextStep: 'Coba memimpin proyek kecil, membuat acara, latihan presentasi, debat, atau simulasi bisnis sederhana.',
  },
  C: {
    summary: 'Conventional menunjukkan minat pada keteraturan, data, angka, administrasi, dokumen, prosedur, dan pekerjaan yang butuh ketelitian.',
    strengths: 'Kuat di konsistensi, detail, membuat sistem rapi, mengelola data, mengikuti aturan, dan menjaga kualitas pekerjaan.',
    majors: ['Akuntansi', 'Statistika', 'Administrasi bisnis', 'Sistem informasi', 'Perpajakan'],
    careers: ['Akuntan', 'Auditor', 'Data administrator', 'Finance operations', 'Analis administrasi'],
    nextStep: 'Coba membuat sistem catatan, spreadsheet sederhana, checklist proyek, atau dokumentasi kegiatan sekolah.',
  },
};

export const varkProfiles: Record<VarkCategory, { summary: string; strategies: string[] }> = {
  V: {
    summary: 'Visual berarti kamu lebih mudah menangkap hubungan antarkonsep lewat gambar, warna, diagram, peta konsep, dan tampilan terstruktur.',
    strategies: ['Ubah catatan menjadi mind map atau flowchart.', 'Gunakan warna untuk menandai ide utama.', 'Cari diagram, infografik, atau video visual saat materi terasa abstrak.'],
  },
  A: {
    summary: 'Aural berarti kamu terbantu oleh suara, penjelasan lisan, diskusi, tanya jawab, dan mengulang materi dengan berbicara.',
    strategies: ['Jelaskan ulang materi dengan suara sendiri.', 'Belajar lewat diskusi atau tanya jawab.', 'Rekam rangkuman singkat lalu dengarkan kembali.'],
  },
  R: {
    summary: 'Read/write berarti kamu nyaman memahami materi lewat teks, catatan, daftar, rangkuman, instruksi tertulis, dan kata kunci.',
    strategies: ['Buat rangkuman satu halaman setelah belajar.', 'Susun daftar istilah dan contoh soal.', 'Baca instruksi/rubrik lalu tulis ulang dengan bahasamu sendiri.'],
  },
  K: {
    summary: 'Kinesthetic berarti kamu lebih paham saat mencoba langsung, memakai contoh nyata, simulasi, latihan soal, atau proyek praktik.',
    strategies: ['Mulai dari contoh soal atau studi kasus.', 'Gunakan simulasi, eksperimen, atau praktik kecil.', 'Hubungkan materi dengan pengalaman sehari-hari.'],
  },
};
