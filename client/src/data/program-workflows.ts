export type FieldType = 'text' | 'textarea' | 'select' | 'multi' | 'number' | 'range' | 'date';

export type WorkflowField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
};

export type WorkflowModule = {
  slug: string;
  title: string;
  description: string;
  fields: WorkflowField[];
};

export type Workflow = {
  programSlug: 'setting-goal' | 'smart-financial';
  title: string;
  grade: string;
  theme: string;
  accent: string;
  modules: WorkflowModule[];
};

export const settingGoalWorkflow: Workflow = {
  programSlug: 'setting-goal',
  title: 'Setting Goal',
  grade: 'Kelas XI',
  theme: 'Rancang pilihan jurusan, karier, dan langkah nyata sejak kelas XI.',
  accent: '#087f5b',
  modules: [
    {
      slug: 'kenali-diriku',
      title: 'Kenali Diriku',
      description: 'Petakan kekuatan, nilai pribadi, dan lingkungan belajar yang paling mendukung pilihan masa depanmu.',
      fields: [
        { key: 'strengths', label: 'Kekuatan utama', type: 'multi', options: ['Analitis', 'Kreatif', 'Komunikatif', 'Teliti', 'Peduli', 'Pemimpin', 'Praktis', 'Mandiri'] },
        { key: 'values', label: 'Nilai yang penting bagiku', type: 'multi', options: ['Dampak sosial', 'Stabilitas', 'Kreativitas', 'Penghasilan', 'Kebebasan', 'Prestasi', 'Keluarga', 'Ilmu pengetahuan'] },
        { key: 'selfNarrative', label: 'Cerita singkat tentang diriku', type: 'textarea', placeholder: 'Hal apa yang membuatmu merasa berkembang selama SMA?' },
      ],
    },
    {
      slug: 'eksplorasi-program-studi',
      title: 'Eksplorasi Program Studi',
      description: 'Bandingkan program studi yang menarik berdasarkan isi belajar dan bukti kecocokan.',
      fields: [
        { key: 'studyPrograms', label: 'Program studi yang diminati', type: 'multi', options: ['Kedokteran', 'Psikologi', 'Teknik Informatika', 'Desain Komunikasi Visual', 'Manajemen', 'Akuntansi', 'Hukum', 'Pendidikan', 'Ilmu Komunikasi', 'Teknik Industri'] },
        { key: 'programReason', label: 'Alasan memilih program studi', type: 'textarea', placeholder: 'Apa yang membuat program studi ini menarik dan masuk akal untukmu?' },
        { key: 'proofToFind', label: 'Bukti yang perlu dicari', type: 'textarea', placeholder: 'Silabus, prospek kerja, biaya kuliah, kampus, atau cerita alumni apa yang perlu kamu cek?' },
      ],
    },
    {
      slug: 'eksplorasi-karier',
      title: 'Eksplorasi Karier',
      description: 'Hubungkan minat studi dengan contoh profesi, aktivitas kerja, dan skill yang diperlukan.',
      fields: [
        { key: 'careerOptions', label: 'Karier yang ingin dieksplorasi', type: 'multi', options: ['Data Analyst', 'Dokter', 'Psikolog', 'Guru', 'Entrepreneur', 'Desainer', 'Akuntan', 'Pengacara', 'Engineer', 'Content Strategist'] },
        { key: 'careerActivities', label: 'Aktivitas kerja yang dibayangkan', type: 'textarea', placeholder: 'Tuliskan aktivitas harian dari karier yang kamu minati.' },
        { key: 'skillsNeeded', label: 'Skill yang perlu dilatih', type: 'multi', options: ['Bahasa Inggris', 'Public speaking', 'Analisis data', 'Menulis', 'Riset', 'Koding', 'Empati', 'Manajemen proyek'] },
      ],
    },
    {
      slug: 'mata-pelajaran-pendukung',
      title: 'Mata Pelajaran Pendukung',
      description: 'Buat gap analysis antara pelajaran pendukung dan kemampuanmu saat ini.',
      fields: [
        { key: 'supportSubjects', label: 'Mata pelajaran pendukung', type: 'multi', options: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi', 'Geografi', 'Informatika'] },
        { key: 'currentGap', label: 'Gap kemampuan saat ini', type: 'textarea', placeholder: 'Pelajaran mana yang perlu ditingkatkan dan kenapa?' },
        { key: 'supportPlan', label: 'Rencana dukungan belajar', type: 'textarea', placeholder: 'Guru, teman, kursus, latihan, atau jadwal apa yang akan membantu?' },
      ],
    },
    {
      slug: 'goal-setting',
      title: 'Goal Setting',
      description: 'Tulis SMART goal agar target masa depanmu bisa diukur.',
      fields: [
        { key: 'smartSpecific', label: 'Specific', type: 'textarea', placeholder: 'Apa target yang ingin kamu capai?' },
        { key: 'smartMeasurable', label: 'Measurable', type: 'textarea', placeholder: 'Indikator apa yang menunjukkan target tercapai?' },
        { key: 'smartDeadline', label: 'Deadline target', type: 'date' },
        { key: 'goalConfidence', label: 'Keyakinan menjalankan target', type: 'range', min: 1, max: 5 },
      ],
    },
    {
      slug: 'rencana-aksi',
      title: 'Rencana Aksi',
      description: 'Ubah goal menjadi kalender tindakan dan prioritas P1-P4.',
      fields: [
        { key: 'priorityOne', label: 'P1 - Harus dilakukan', type: 'textarea', placeholder: 'Aksi paling penting minggu ini.' },
        { key: 'priorityTwo', label: 'P2 - Penting berikutnya', type: 'textarea', placeholder: 'Aksi penting setelah P1.' },
        { key: 'calendarPlan', label: 'Rencana kalender 4 minggu', type: 'textarea', placeholder: 'Tuliskan jadwal aksi per minggu.' },
      ],
    },
    {
      slug: 'dashboard-perkembangan',
      title: 'Dashboard Perkembangan',
      description: 'Catat status target dan hambatan agar progress mudah dipantau.',
      fields: [
        { key: 'progress', label: 'Progress target', type: 'range', min: 0, max: 100 },
        { key: 'blockers', label: 'Hambatan utama', type: 'multi', options: ['Waktu', 'Motivasi', 'Biaya', 'Informasi kurang', 'Dukungan belum cukup', 'Nilai pelajaran'] },
        { key: 'nextCheckpoint', label: 'Tanggal cek berikutnya', type: 'date' },
      ],
    },
    {
      slug: 'refleksi',
      title: 'Refleksi',
      description: 'Tutup program dengan pelajaran penting dan keputusan berikutnya.',
      fields: [
        { key: 'bestInsight', label: 'Insight paling penting', type: 'textarea', placeholder: 'Apa yang paling kamu pahami tentang arah masa depanmu?' },
        { key: 'decision', label: 'Keputusan sementara', type: 'textarea', placeholder: 'Pilihan jurusan/karier apa yang ingin kamu lanjut eksplorasi?' },
        { key: 'supportNeeded', label: 'Dukungan yang dibutuhkan', type: 'textarea', placeholder: 'Apa yang perlu dibantu Guru BK, orang tua, atau mentor?' },
      ],
    },
  ],
};

export const smartFinancialWorkflow: Workflow = {
  programSlug: 'smart-financial',
  title: 'Smart Financial',
  grade: 'Kelas XII',
  theme: 'Latih keputusan finansial sebelum hidup mandiri setelah lulus.',
  accent: '#b45309',
  modules: [
    {
      slug: 'identitas-dan-target',
      title: 'Identitas dan Target',
      description: 'Petakan rencana setelah lulus, uang saku, tabungan, dan dana darurat awal.',
      fields: [
        { key: 'afterGraduationTarget', label: 'Target setelah lulus', type: 'select', options: ['Kuliah di kota sendiri', 'Kuliah di luar kota', 'Kerja', 'Gap year produktif', 'Wirausaha'] },
        { key: 'monthlyAllowance', label: 'Uang saku per bulan', type: 'number', min: 0 },
        { key: 'currentSavings', label: 'Tabungan saat ini', type: 'number', min: 0 },
        { key: 'emergencyFund', label: 'Dana darurat saat ini', type: 'number', min: 0 },
        { key: 'financialConcern', label: 'Kekhawatiran finansial utama', type: 'textarea', placeholder: 'Biaya apa yang paling kamu khawatirkan?' },
      ],
    },
    {
      slug: 'pilih-kota-tujuan',
      title: 'Pilih Kota Tujuan',
      description: 'Pilih kota dan bandingkan estimasi biaya hidup bulanan.',
      fields: [
        { key: 'destinationCity', label: 'Kota tujuan', type: 'select', options: ['Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Malang', 'Semarang'] },
        { key: 'livingStrategy', label: 'Strategi tempat tinggal', type: 'select', options: ['Kos sendiri', 'Kos berbagi', 'Tinggal dengan keluarga', 'Asrama', 'PP dari rumah'] },
        { key: 'costNotes', label: 'Catatan biaya', type: 'textarea', placeholder: 'Biaya apa yang perlu dicek lebih detail?' },
      ],
    },
    {
      slug: 'simulasi-financial-readiness',
      title: 'Future Ready Board',
      description: 'Mainkan 12 keputusan finansial, ambil kartu darurat, lalu lihat saldo, lives, badge, dan skor kesiapan.',
      fields: [
        { key: 'monthlySavingPlan', label: 'Rencana menabung per bulan', type: 'number', min: 0 },
        { key: 'simulationReflection', label: 'Refleksi simulasi', type: 'textarea', placeholder: 'Keputusan apa yang paling sulit dan apa pelajarannya?' },
      ],
    },
    {
      slug: 'hasil-dan-rekomendasi',
      title: 'Hasil dan Rekomendasi',
      description: 'Ringkas kesiapan, risiko, dan rekomendasi akademik/karier/finansial.',
      fields: [
        { key: 'academicRecommendation', label: 'Rekomendasi akademik', type: 'textarea', placeholder: 'Apa yang perlu disiapkan dari sisi akademik?' },
        { key: 'careerRecommendation', label: 'Rekomendasi karier', type: 'textarea', placeholder: 'Skill/pekerjaan sampingan apa yang relevan?' },
        { key: 'financialRecommendation', label: 'Rekomendasi finansial', type: 'textarea', placeholder: 'Kebiasaan finansial apa yang perlu dimulai?' },
        { key: 'socialRecommendation', label: 'Rekomendasi sosial', type: 'textarea', placeholder: 'Siapa yang perlu diajak diskusi atau mendukung rencana ini?' },
      ],
    },
  ],
};

export const workflows = {
  'setting-goal': settingGoalWorkflow,
  'smart-financial': smartFinancialWorkflow,
};
