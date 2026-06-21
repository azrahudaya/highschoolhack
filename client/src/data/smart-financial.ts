export type SimulationOption = {
  id: string;
  label: string;
  effect: string;
  cashImpact: number;
  scoreImpact: number;
  riskImpact: number;
};

export type SimulationStep = {
  id: string;
  title: string;
  prompt: string;
  options: SimulationOption[];
};

export type EmergencyEvent = {
  id: string;
  title: string;
  description: string;
  cashImpact: number;
  riskImpact: number;
};

export type ScholarshipItem = {
  name: string;
  type: string;
  provider: string;
  url: string;
  description: string;
  fit: string[];
  deadline?: string;
  status?: string;
  lastVerified?: string;
};

export const simulationSteps: SimulationStep[] = [
  {
    id: 'target',
    title: 'Target',
    prompt: 'Sebelum memilih kota/kampus, apa langkah pertama yang paling aman?',
    options: [
      { id: 'compare', label: 'Bandingkan 2 kota dan 2 kampus', effect: '+arah jelas', cashImpact: 0, scoreImpact: 10, riskImpact: -5 },
      { id: 'follow-friend', label: 'Ikut pilihan teman dulu', effect: '+cepat, risiko tinggi', cashImpact: 0, scoreImpact: 2, riskImpact: 12 },
      { id: 'consult', label: 'Diskusi opsi dengan keluarga/Guru BK', effect: '+validasi rencana', cashImpact: 0, scoreImpact: 9, riskImpact: -4 },
    ],
  },
  {
    id: 'housing',
    title: 'Kos',
    prompt: 'Strategi tempat tinggal mana yang kamu pilih untuk bulan awal?',
    options: [
      { id: 'shared', label: 'Kos berbagi / asrama', effect: 'hemat biaya tetap', cashImpact: -650000, scoreImpact: 9, riskImpact: -4 },
      { id: 'private', label: 'Kos sendiri dekat kampus', effect: 'nyaman tapi mahal', cashImpact: -1400000, scoreImpact: 4, riskImpact: 8 },
      { id: 'family-temporary', label: 'Tinggal sementara dengan keluarga', effect: 'adaptasi lebih aman', cashImpact: -350000, scoreImpact: 8, riskImpact: -6 },
    ],
  },
  {
    id: 'food',
    title: 'Makan',
    prompt: 'Pilih pola makan harian yang realistis.',
    options: [
      { id: 'meal-plan', label: 'Meal plan sederhana', effect: 'stabil dan hemat', cashImpact: -900000, scoreImpact: 9, riskImpact: -3 },
      { id: 'delivery', label: 'Sering pesan online', effect: 'praktis tapi bocor', cashImpact: -1600000, scoreImpact: 3, riskImpact: 10 },
      { id: 'cook-mix', label: 'Masak ringan + warteg terencana', effect: 'hemat tanpa ekstrem', cashImpact: -750000, scoreImpact: 8, riskImpact: -2 },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    prompt: 'Bagaimana kamu mengatur transport?',
    options: [
      { id: 'public', label: 'Transport umum + jalan kaki', effect: 'lebih hemat', cashImpact: -280000, scoreImpact: 8, riskImpact: -2 },
      { id: 'ride-hailing', label: 'Ojol hampir tiap hari', effect: 'cepat tapi mahal', cashImpact: -750000, scoreImpact: 4, riskImpact: 7 },
      { id: 'campus-shuttle', label: 'Cari shuttle kampus / sepeda', effect: 'hemat bila tersedia', cashImpact: -180000, scoreImpact: 7, riskImpact: -1 },
    ],
  },
  {
    id: 'study-tools',
    title: 'Buku',
    prompt: 'Kebutuhan belajar pertama dibeli bagaimana?',
    options: [
      { id: 'priority', label: 'Beli prioritas + pinjam dulu', effect: 'cukup dan terkendali', cashImpact: -250000, scoreImpact: 8, riskImpact: -2 },
      { id: 'all-new', label: 'Beli semua baru sekaligus', effect: 'lengkap tapi berat', cashImpact: -900000, scoreImpact: 4, riskImpact: 8 },
      { id: 'used-digital', label: 'Cari bekas/digital sebelum beli', effect: 'hemat dan fleksibel', cashImpact: -120000, scoreImpact: 9, riskImpact: -3 },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    prompt: 'Pilih kebiasaan bulanan untuk kebutuhan kecil.',
    options: [
      { id: 'mixed', label: 'Cuci sendiri, laundry seperlunya', effect: 'biaya kecil terjaga', cashImpact: -120000, scoreImpact: 7, riskImpact: -1 },
      { id: 'full-service', label: 'Laundry semua pakaian', effect: 'praktis tapi rutin bocor', cashImpact: -300000, scoreImpact: 3, riskImpact: 4 },
      { id: 'weekly-budget', label: 'Buat batas laundry mingguan', effect: 'pengeluaran kecil terukur', cashImpact: -160000, scoreImpact: 8, riskImpact: -2 },
    ],
  },
  {
    id: 'phone',
    title: 'Pulsa',
    prompt: 'Paket internet seperti apa yang kamu pilih?',
    options: [
      { id: 'student-plan', label: 'Paket pelajar sesuai kebutuhan', effect: 'cukup untuk belajar', cashImpact: -90000, scoreImpact: 7, riskImpact: -1 },
      { id: 'unlimited', label: 'Paket mahal tanpa batas', effect: 'nyaman tapi boros', cashImpact: -250000, scoreImpact: 4, riskImpact: 4 },
      { id: 'wifi-first', label: 'Paket sedang + manfaatkan Wi-Fi', effect: 'hemat dan tetap online', cashImpact: -70000, scoreImpact: 8, riskImpact: -2 },
    ],
  },
  {
    id: 'community',
    title: 'Organisasi',
    prompt: 'Ada ajakan ikut kegiatan berbayar. Apa keputusanmu?',
    options: [
      { id: 'selective', label: 'Pilih satu yang relevan', effect: 'jejaring tetap tumbuh', cashImpact: -150000, scoreImpact: 8, riskImpact: -1 },
      { id: 'all-events', label: 'Ikut banyak kegiatan', effect: 'seru tapi mahal', cashImpact: -650000, scoreImpact: 4, riskImpact: 8 },
      { id: 'free-first', label: 'Mulai dari komunitas gratis', effect: 'coba dulu tanpa beban biaya', cashImpact: 0, scoreImpact: 7, riskImpact: -2 },
    ],
  },
  {
    id: 'emergency',
    title: 'Darurat',
    prompt: 'Saat ada kejadian mendadak, apa prinsipmu?',
    options: [
      { id: 'use-fund', label: 'Pakai dana darurat + catat ulang', effect: 'krisis terkendali', cashImpact: -250000, scoreImpact: 9, riskImpact: -5 },
      { id: 'paylater', label: 'Pakai paylater dulu', effect: 'cepat tapi risiko naik', cashImpact: -100000, scoreImpact: 1, riskImpact: 18 },
      { id: 'ask-help', label: 'Cari bantuan dan kurangi biaya lain', effect: 'tidak sendirian', cashImpact: -150000, scoreImpact: 8, riskImpact: -4 },
    ],
  },
  {
    id: 'side-income',
    title: 'Side income',
    prompt: 'Pilih cara menambah pemasukan.',
    options: [
      { id: 'tutor', label: 'Tutor kecil/freelance ringan', effect: 'pemasukan bertambah', cashImpact: 450000, scoreImpact: 10, riskImpact: -4 },
      { id: 'none', label: 'Belum mencari pemasukan', effect: 'lebih fokus, tapi kas tetap', cashImpact: 0, scoreImpact: 4, riskImpact: 4 },
      { id: 'sell-skill', label: 'Jual skill kecil dari hobi', effect: 'latihan karier awal', cashImpact: 250000, scoreImpact: 8, riskImpact: -2 },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    prompt: 'Akhir bulan, apa yang kamu lakukan?',
    options: [
      { id: 'review-budget', label: 'Review budget dan kurangi bocor', effect: 'belajar dari data', cashImpact: 150000, scoreImpact: 10, riskImpact: -5 },
      { id: 'ignore', label: 'Lanjut saja bulan depan', effect: 'risiko pola boros berulang', cashImpact: 0, scoreImpact: 2, riskImpact: 10 },
      { id: 'three-leaks', label: 'Catat 3 pengeluaran paling bocor', effect: 'fokus perbaikan jelas', cashImpact: 100000, scoreImpact: 8, riskImpact: -4 },
    ],
  },
  {
    id: 'ready',
    title: 'Siap',
    prompt: 'Keputusan akhir sebelum berangkat.',
    options: [
      { id: 'discuss', label: 'Diskusi dengan orang tua/Guru BK', effect: 'rencana tervalidasi', cashImpact: 0, scoreImpact: 10, riskImpact: -6 },
      { id: 'decide-alone', label: 'Putuskan sendiri saja', effect: 'mandiri tapi blind spot', cashImpact: 0, scoreImpact: 4, riskImpact: 8 },
      { id: 'delay-validate', label: 'Tunda sebulan untuk validasi biaya', effect: 'lebih siap sebelum berangkat', cashImpact: 250000, scoreImpact: 9, riskImpact: -5 },
    ],
  },
];

export const emergencyEvents: EmergencyEvent[] = [
  { id: 'laptop', title: 'Laptop rusak', description: 'Laptop rusak saat minggu ujian.', cashImpact: -700000, riskImpact: 12 },
  { id: 'transport-rise', title: 'Transport naik', description: 'Biaya transport naik karena jadwal padat.', cashImpact: -250000, riskImpact: 6 },
  { id: 'activity-fee', title: 'Iuran kegiatan', description: 'Ada iuran kegiatan mendadak.', cashImpact: -200000, riskImpact: 5 },
  { id: 'medicine', title: 'Obat dan klinik', description: 'Perlu biaya kesehatan ringan.', cashImpact: -300000, riskImpact: 8 },
];

export const scholarshipPortal: ScholarshipItem[] = [
  {
    name: 'KIP Kuliah',
    type: 'Pemerintah',
    provider: 'Kemdiktisaintek',
    url: 'https://kip-kuliah.kemdiktisaintek.go.id/',
    description: 'Bantuan biaya pendidikan untuk calon mahasiswa yang memenuhi syarat akademik dan ekonomi melalui laman resmi KIP Kuliah.',
    fit: ['Kuliah', 'Butuh bantuan biaya', 'Dalam negeri', 'Lulusan 2024-2026'],
    deadline: 'Cek jadwal jalur seleksi 2026 di laman resmi',
    status: 'Aktif 2026',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'KIP Kuliah Kemenag',
    type: 'Pemerintah',
    provider: 'Kementerian Agama',
    url: 'https://kip-kuliah.kemenag.go.id/',
    description: 'Portal KIP Kuliah untuk lingkungan perguruan tinggi keagamaan di bawah Kementerian Agama.',
    fit: ['PTKI', 'Butuh bantuan biaya', 'Dalam negeri'],
    deadline: 'Pantau jadwal 2026 di laman resmi',
    status: 'Portal resmi aktif',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa Garuda Sarjana',
    type: 'Talenta',
    provider: 'Kemdiktisaintek / LPDP',
    url: 'https://beasiswagaruda.kemdiktisaintek.go.id/',
    description: 'Beasiswa S1 untuk putra-putri terbaik Indonesia yang menargetkan perguruan tinggi terbaik dunia.',
    fit: ['Prestasi', 'S1', 'Luar negeri', 'Talenta'],
    deadline: 'Gelombang II: 25 Mei - 25 Juni 2026',
    status: 'Sedang dibuka',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa Indonesia Maju',
    type: 'Talenta',
    provider: 'Kemdiktisaintek',
    url: 'https://bim.kemdiktisaintek.go.id/',
    description: 'Program beasiswa untuk peserta didik atau lulusan berprestasi; cek angkatan dan gelombang terbaru di portal resmi.',
    fit: ['Prestasi', 'Persiapan studi', 'Talenta', 'Luar negeri'],
    deadline: 'Pantau gelombang terbaru di laman resmi',
    status: 'Portal resmi aktif',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa Unggulan',
    type: 'Pemerintah',
    provider: 'Kemendikdasmen',
    url: 'https://beasiswaunggulan.kemendikdasmen.go.id/',
    description: 'Beasiswa pendidikan pemerintah untuk jenjang sarjana, magister, dan doktor sesuai ketentuan resmi.',
    fit: ['Prestasi', 'Kuliah', 'Dalam negeri', 'S1'],
    deadline: 'Pantau pengumuman resmi; halaman utama masih menampilkan jadwal 2025',
    status: 'Portal resmi aktif, jadwal 2026 belum final',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'LPDP Terintegrasi',
    type: 'Studi lanjut',
    provider: 'Kementerian Keuangan',
    url: 'https://beasiswalpdp-terintegrasi.kemenkeu.go.id/',
    description: 'Portal pendaftaran terintegrasi untuk skema beasiswa LPDP dan program kolaborasi lintas jenjang.',
    fit: ['Studi lanjut', 'S1/S2/S3', 'Perencanaan jangka panjang'],
    deadline: 'Beberapa skema 2026 dibuka Mei - Juni',
    status: 'Cek jadwal per skema',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Australia Awards',
    type: 'Internasional',
    provider: 'Pemerintah Australia',
    url: 'https://www.australiaawardsindonesia.org/id/Howtoapply',
    description: 'Beasiswa internasional dari Pemerintah Australia; gunakan halaman resmi untuk mengecek intake berikutnya.',
    fit: ['Internasional', 'Bahasa Inggris', 'Studi lanjut', 'Australia'],
    deadline: 'Intake 2027 ditutup 30 April 2026',
    status: 'Pantau intake berikutnya',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'ASEAN Undergraduate Scholarship - NUS',
    type: 'Internasional',
    provider: 'National University of Singapore',
    url: 'https://nus.edu.sg/oam/scholarships/scholarships-for-freshmen-singapore-permanent-residents/asean-undergraduate-scholarship',
    description: 'Beasiswa S1 NUS untuk freshmen dari negara ASEAN yang dipertimbangkan melalui aplikasi undergraduate NUS.',
    fit: ['Internasional', 'Singapura', 'S1', 'Prestasi'],
    deadline: 'Ikuti jadwal admission NUS',
    status: 'Cek saat daftar NUS',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Financial Aid ITB',
    type: 'Kampus',
    provider: 'Institut Teknologi Bandung',
    url: 'https://finaid.itb.ac.id/',
    description: 'Portal resmi beasiswa ITB untuk mahasiswa, termasuk beasiswa mitra yang diperbarui mengikuti ketersediaan program.',
    fit: ['Dalam negeri', 'Kampus', 'S1', 'ITB'],
    deadline: 'Berubah per program',
    status: 'Portal resmi aktif',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa BCA PPBP/PPTI',
    type: 'Korporasi',
    provider: 'BCA',
    url: 'https://karir.bca.co.id/beasiswa-bca',
    description: 'Program pendidikan 2,5 tahun untuk siswa kelas XI, XII, atau lulusan SMA/SMK melalui jalur bisnis perbankan dan teknik informatika.',
    fit: ['Lulusan SMA/SMK', 'Teknologi', 'Bisnis', 'Uang saku'],
    deadline: 'Tahun ajaran 2027: 13 April - 20 Oktober 2026',
    status: 'Sedang dibuka',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'OSC Medcom S1',
    type: 'Kompetisi',
    provider: 'Medcom.id / Surya Edukasi Bangsa Foundation',
    url: 'https://osc.medcom.id/beasiswa/universitas-s1',
    description: 'Kompetisi beasiswa online untuk calon mahasiswa S1 di kampus swasta mitra, dengan seleksi online dan final test.',
    fit: ['SMA/SMK/MA kelas XII', 'PTS', 'Tes online', 'Dalam negeri'],
    deadline: 'OSC 2026: pendaftaran ditutup 3 Juni 2026; pantau siklus berikutnya',
    status: 'Tahap seleksi 2026 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa IDCloudHost x Telkom University',
    type: 'Kampus',
    provider: 'IDCloudHost / Telkom University',
    url: 'https://idcloudhost.com/beasiswa/',
    description: 'Beasiswa biaya kuliah 4 tahun di Telkom University, dengan proses seleksi rapor, tes online, dan wawancara.',
    fit: ['Telkom University', 'Teknologi', 'SMA/SMK', 'Beasiswa penuh'],
    deadline: '2026: pendaftaran 2 Februari - 31 Mei; pengumuman 29 Juni 2026',
    status: 'Seleksi 2026 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Beasiswa APERTI BUMN',
    type: 'Kampus',
    provider: 'Aliansi Perguruan Tinggi BUMN',
    url: 'https://smb.telkomuniversity.ac.id/jalur-seleksi/beasiswa-aperti/',
    description: 'Jalur beasiswa penuh atau parsial di kampus anggota APERTI BUMN seperti Telkom University, IT PLN, Universitas Pertamina, ULBI, UISI, dan lainnya.',
    fit: ['Kampus BUMN', 'Prestasi', 'SMA/SMK/MA', 'Dalam negeri'],
    deadline: '2026: pendaftaran 25 Mei - 7 Juni; pengumuman akhir 2 Juli 2026',
    status: 'Pendaftaran 2026 sudah berakhir, seleksi berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'MEXT Undergraduate / Gakubu',
    type: 'Internasional',
    provider: 'Kedutaan Besar Jepang di Indonesia',
    url: 'https://www.id.emb-japan.go.jp/itpr_id/sch_gakubu.html',
    description: 'Beasiswa Pemerintah Jepang untuk lulusan SMA/SMK/sederajat yang ingin kuliah S1 di Jepang, termasuk sekolah persiapan bahasa Jepang.',
    fit: ['Jepang', 'S1', 'SMA/SMK', 'Full scholarship'],
    deadline: 'Keberangkatan 2027: pendaftaran 1 - 19 April 2026',
    status: 'Seleksi 2027 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'MEXT College of Technology / KOSEN',
    type: 'Internasional',
    provider: 'Kedutaan Besar Jepang di Indonesia',
    url: 'https://www.id.emb-japan.go.jp/itpr_id/sch_kosen.html',
    description: 'Beasiswa Jepang untuk jalur College of Technology yang berfokus pada pendidikan teknik dan praktik bagi lulusan SMA/SMK jurusan IPA.',
    fit: ['Jepang', 'Teknik', 'Vokasi', 'SMA/SMK IPA'],
    deadline: 'Keberangkatan 2027: pendaftaran 20 April - 10 Mei 2026',
    status: 'Seleksi 2027 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'MEXT Specialized Training College / Senshu',
    type: 'Internasional',
    provider: 'Kedutaan Besar Jepang di Indonesia',
    url: 'https://www.id.emb-japan.go.jp/itpr_id/sch_senshu.html',
    description: 'Beasiswa Jepang untuk sekolah kejuruan setingkat diploma dengan peluang lanjut ke jenjang S1 sebagai mahasiswa tahun ketiga.',
    fit: ['Jepang', 'Vokasi', 'Diploma', 'SMA/SMK'],
    deadline: 'Keberangkatan 2027: pendaftaran 20 April - 10 Mei 2026',
    status: 'Seleksi 2027 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Global Korea Scholarship Undergraduate',
    type: 'Internasional',
    provider: 'Korean Education Center Indonesia',
    url: 'https://www.kecid.org/news/announcement_detail/13',
    description: 'Beasiswa Pemerintah Korea untuk program undergraduate di Korea Selatan melalui embassy track atau university track.',
    fit: ['Korea Selatan', 'S1', 'Full scholarship', 'Bahasa Inggris/Korea'],
    deadline: 'GKS-U 2026: deadline aplikasi 17 Oktober 2025; pantau pengumuman intake berikutnya',
    status: 'Siklus 2026 sudah lewat',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'ASEAN Undergraduate Scholarship - NTU',
    type: 'Internasional',
    provider: 'Nanyang Technological University',
    url: 'https://www.ntu.edu.sg/admissions/undergraduate/scholarships/scholarship-opportunities/detail/asean-undergraduate-scholarship',
    description: 'Beasiswa S1 NTU untuk warga negara ASEAN selain Singapura, diproses bersama aplikasi undergraduate.',
    fit: ['Singapura', 'S1', 'Prestasi', 'ASEAN'],
    deadline: 'Ikuti periode admission dan scholarship NTU',
    status: 'Cek saat daftar NTU',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'ASEAN Undergraduate Scholarship - SMU',
    type: 'Internasional',
    provider: 'Singapore Management University',
    url: 'https://admissions.smu.edu.sg/financial-aid/asean-undergraduate-scholarship',
    description: 'Beasiswa S1 SMU untuk pelamar dari negara ASEAN dengan hasil akademik, kepemimpinan, dan aktivitas ko-kurikuler yang kuat.',
    fit: ['Singapura', 'S1', 'Bisnis/Manajemen', 'ASEAN'],
    deadline: 'Ikuti periode admission SMU',
    status: 'Cek saat daftar SMU',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Türkiye Scholarships',
    type: 'Internasional',
    provider: 'Pemerintah Turki',
    url: 'https://www.turkiyeburslari.gov.tr/announcements/turkiye-scholarships-2026-applications-121',
    description: 'Beasiswa internasional untuk jenjang bachelor, master, dan PhD di Turki melalui satu portal aplikasi resmi.',
    fit: ['Turki', 'S1/S2/S3', 'Full scholarship', 'Internasional'],
    deadline: '2026: pendaftaran 10 Januari - 20 Februari 2026',
    status: 'Siklus 2026 sudah lewat, pantau kalender berikutnya',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Jardine Scholarship',
    type: 'Internasional',
    provider: 'Jardine Foundation',
    url: 'https://www.jardine-foundation.org/scholarship-schemes',
    description: 'Beasiswa undergraduate untuk Oxford, Cambridge, dan beberapa skema mitra Asia bagi pelamar dari negara termasuk Indonesia.',
    fit: ['Oxford/Cambridge', 'S1', 'Prestasi', 'Leadership'],
    deadline: 'Aplikasi 2027: 14 Agustus - 23 Oktober 2026',
    status: 'Akan dibuka Agustus 2026',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Mitsui-Bussan Scholarship Program for Indonesia',
    type: 'Internasional',
    provider: 'Mitsui & Co.',
    url: 'https://www.mbkscholarship-id.com/',
    description: 'Beasiswa S1 Jepang untuk siswa Indonesia berprestasi, termasuk persiapan bahasa Jepang sebelum masuk universitas.',
    fit: ['Jepang', 'S1', 'Lulusan SMA', 'Full scholarship'],
    deadline: 'Cek prospektus dan pengumuman seleksi terbaru',
    status: 'Seleksi 2026 berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'TELADAN Tanoto Foundation',
    type: 'Kepemimpinan',
    provider: 'Tanoto Foundation',
    url: 'https://www.tanotofoundation.org/initiative/teladan/',
    description: 'Program beasiswa dan pengembangan kepemimpinan untuk mahasiswa S1 di perguruan tinggi mitra Tanoto Foundation.',
    fit: ['Mahasiswa baru', 'Kepemimpinan', 'Kampus mitra', 'Uang saku'],
    deadline: 'Pantau pembukaan TELADAN cohort berikutnya',
    status: 'Portal program aktif',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Djarum Beasiswa Plus',
    type: 'Korporasi',
    provider: 'Djarum Foundation',
    url: 'https://djarumbeasiswaplus.org/',
    description: 'Beasiswa prestasi untuk mahasiswa D4/S1 aktif yang dilengkapi pelatihan soft skills dan jejaring Beswan Djarum.',
    fit: ['Saat kuliah', 'Semester 4', 'Soft skills', 'Prestasi'],
    deadline: 'Pantau pendaftaran 2026/2027 di portal resmi',
    status: 'Portal resmi aktif',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'Pertamina Sobat Bumi',
    type: 'Korporasi',
    provider: 'Pertamina Foundation',
    url: 'https://pertaminafoundation.org/',
    description: 'Beasiswa untuk mahasiswa berprestasi yang memiliki kepedulian sosial dan lingkungan melalui program Pertamina Foundation.',
    fit: ['Saat kuliah', 'Lingkungan', 'Sosial', 'Dalam negeri'],
    deadline: '2026: pendaftaran 1 - 31 Mei 2026',
    status: 'Pendaftaran 2026 ditutup, seleksi berjalan',
    lastVerified: '21 Juni 2026',
  },
  {
    name: 'President University Scholarships',
    type: 'Kampus',
    provider: 'President University',
    url: 'https://admission.president.ac.id/pg/78-scholarship-admission',
    description: 'Skema beasiswa untuk calon mahasiswa Indonesia melalui merit scholarship, jalur rapor SMA kelas X-XII, dan jalur prestasi non-akademik.',
    fit: ['Dalam negeri', 'PTS', 'Jalur rapor', 'Prestasi'],
    deadline: 'Ikuti periode admission President University',
    status: 'Portal admission aktif',
    lastVerified: '21 Juni 2026',
  },
];
