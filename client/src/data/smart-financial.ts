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
};

export const simulationSteps: SimulationStep[] = [
  {
    id: 'target',
    title: 'Target',
    prompt: 'Sebelum memilih kota/kampus, apa langkah pertama yang paling aman?',
    options: [
      { id: 'compare', label: 'Bandingkan 2 kota dan 2 kampus', effect: '+arah jelas', cashImpact: 0, scoreImpact: 10, riskImpact: -5 },
      { id: 'follow-friend', label: 'Ikut pilihan teman dulu', effect: '+cepat, risiko tinggi', cashImpact: 0, scoreImpact: 2, riskImpact: 12 },
    ],
  },
  {
    id: 'housing',
    title: 'Kos',
    prompt: 'Strategi tempat tinggal mana yang kamu pilih untuk bulan awal?',
    options: [
      { id: 'shared', label: 'Kos berbagi / asrama', effect: 'hemat biaya tetap', cashImpact: -650000, scoreImpact: 9, riskImpact: -4 },
      { id: 'private', label: 'Kos sendiri dekat kampus', effect: 'nyaman tapi mahal', cashImpact: -1400000, scoreImpact: 4, riskImpact: 8 },
    ],
  },
  {
    id: 'food',
    title: 'Makan',
    prompt: 'Pilih pola makan harian yang realistis.',
    options: [
      { id: 'meal-plan', label: 'Meal plan sederhana', effect: 'stabil dan hemat', cashImpact: -900000, scoreImpact: 9, riskImpact: -3 },
      { id: 'delivery', label: 'Sering pesan online', effect: 'praktis tapi bocor', cashImpact: -1600000, scoreImpact: 3, riskImpact: 10 },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    prompt: 'Bagaimana kamu mengatur transport?',
    options: [
      { id: 'public', label: 'Transport umum + jalan kaki', effect: 'lebih hemat', cashImpact: -280000, scoreImpact: 8, riskImpact: -2 },
      { id: 'ride-hailing', label: 'Ojol hampir tiap hari', effect: 'cepat tapi mahal', cashImpact: -750000, scoreImpact: 4, riskImpact: 7 },
    ],
  },
  {
    id: 'study-tools',
    title: 'Buku',
    prompt: 'Kebutuhan belajar pertama dibeli bagaimana?',
    options: [
      { id: 'priority', label: 'Beli prioritas + pinjam dulu', effect: 'cukup dan terkendali', cashImpact: -250000, scoreImpact: 8, riskImpact: -2 },
      { id: 'all-new', label: 'Beli semua baru sekaligus', effect: 'lengkap tapi berat', cashImpact: -900000, scoreImpact: 4, riskImpact: 8 },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    prompt: 'Pilih kebiasaan bulanan untuk kebutuhan kecil.',
    options: [
      { id: 'mixed', label: 'Cuci sendiri, laundry seperlunya', effect: 'biaya kecil terjaga', cashImpact: -120000, scoreImpact: 7, riskImpact: -1 },
      { id: 'full-service', label: 'Laundry semua pakaian', effect: 'praktis tapi rutin bocor', cashImpact: -300000, scoreImpact: 3, riskImpact: 4 },
    ],
  },
  {
    id: 'phone',
    title: 'Pulsa',
    prompt: 'Paket internet seperti apa yang kamu pilih?',
    options: [
      { id: 'student-plan', label: 'Paket pelajar sesuai kebutuhan', effect: 'cukup untuk belajar', cashImpact: -90000, scoreImpact: 7, riskImpact: -1 },
      { id: 'unlimited', label: 'Paket mahal tanpa batas', effect: 'nyaman tapi boros', cashImpact: -250000, scoreImpact: 4, riskImpact: 4 },
    ],
  },
  {
    id: 'community',
    title: 'Organisasi',
    prompt: 'Ada ajakan ikut kegiatan berbayar. Apa keputusanmu?',
    options: [
      { id: 'selective', label: 'Pilih satu yang relevan', effect: 'jejaring tetap tumbuh', cashImpact: -150000, scoreImpact: 8, riskImpact: -1 },
      { id: 'all-events', label: 'Ikut banyak kegiatan', effect: 'seru tapi mahal', cashImpact: -650000, scoreImpact: 4, riskImpact: 8 },
    ],
  },
  {
    id: 'emergency',
    title: 'Darurat',
    prompt: 'Saat ada kejadian mendadak, apa prinsipmu?',
    options: [
      { id: 'use-fund', label: 'Pakai dana darurat + catat ulang', effect: 'krisis terkendali', cashImpact: -250000, scoreImpact: 9, riskImpact: -5 },
      { id: 'paylater', label: 'Pakai paylater dulu', effect: 'cepat tapi risiko naik', cashImpact: -100000, scoreImpact: 1, riskImpact: 18 },
    ],
  },
  {
    id: 'side-income',
    title: 'Side income',
    prompt: 'Pilih cara menambah pemasukan.',
    options: [
      { id: 'tutor', label: 'Tutor kecil/freelance ringan', effect: 'pemasukan bertambah', cashImpact: 450000, scoreImpact: 10, riskImpact: -4 },
      { id: 'none', label: 'Belum mencari pemasukan', effect: 'lebih fokus, tapi kas tetap', cashImpact: 0, scoreImpact: 4, riskImpact: 4 },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    prompt: 'Akhir bulan, apa yang kamu lakukan?',
    options: [
      { id: 'review-budget', label: 'Review budget dan kurangi bocor', effect: 'belajar dari data', cashImpact: 150000, scoreImpact: 10, riskImpact: -5 },
      { id: 'ignore', label: 'Lanjut saja bulan depan', effect: 'risiko pola boros berulang', cashImpact: 0, scoreImpact: 2, riskImpact: 10 },
    ],
  },
  {
    id: 'ready',
    title: 'Siap',
    prompt: 'Keputusan akhir sebelum berangkat.',
    options: [
      { id: 'discuss', label: 'Diskusi dengan orang tua/Guru BK', effect: 'rencana tervalidasi', cashImpact: 0, scoreImpact: 10, riskImpact: -6 },
      { id: 'decide-alone', label: 'Putuskan sendiri saja', effect: 'mandiri tapi blind spot', cashImpact: 0, scoreImpact: 4, riskImpact: 8 },
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
    provider: 'Kemendikbudristek',
    url: 'https://kip-kuliah.kemdikbud.go.id/',
    description: 'Bantuan biaya pendidikan untuk calon mahasiswa yang memenuhi syarat akademik dan ekonomi.',
    fit: ['Kuliah', 'Butuh bantuan biaya', 'Dalam negeri'],
  },
  {
    name: 'Beasiswa Indonesia Maju',
    type: 'Talenta',
    provider: 'Puspresnas',
    url: 'https://bim-pusatprestasinasional.kemdikbud.go.id/',
    description: 'Program dukungan bagi siswa berprestasi untuk pengembangan dan persiapan studi lanjut.',
    fit: ['Prestasi', 'Persiapan studi', 'Talenta'],
  },
  {
    name: 'Beasiswa Unggulan',
    type: 'Pemerintah',
    provider: 'Kemendikbudristek',
    url: 'https://beasiswaunggulan.kemdikbud.go.id/',
    description: 'Referensi beasiswa pendidikan untuk pelajar/mahasiswa berprestasi sesuai ketentuan resmi.',
    fit: ['Prestasi', 'Kuliah', 'Dalam negeri'],
  },
  {
    name: 'LPDP',
    type: 'Studi lanjut',
    provider: 'Kementerian Keuangan',
    url: 'https://lpdp.kemenkeu.go.id/',
    description: 'Referensi awal untuk memahami ekosistem beasiswa studi lanjut pemerintah.',
    fit: ['Studi lanjut', 'Perencanaan jangka panjang'],
  },
  {
    name: 'Australia Awards',
    type: 'Internasional',
    provider: 'Pemerintah Australia',
    url: 'https://www.australiaawardsindonesia.org/',
    description: 'Referensi beasiswa internasional untuk memahami opsi studi dan seleksi global.',
    fit: ['Internasional', 'Bahasa Inggris', 'Studi lanjut'],
  },
];
