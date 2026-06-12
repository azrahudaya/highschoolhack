export type RiasecCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type VarkCategory = 'V' | 'A' | 'R' | 'K';

export const riasecLabels: Record<RiasecCategory, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

const riasecStatements: Record<RiasecCategory, string[]> = {
  R: [
    'Saya menikmati kegiatan yang melibatkan alat, benda, atau praktik langsung.',
    'Saya tertarik memahami cara kerja mesin atau perangkat.',
    'Saya senang memperbaiki atau merakit sesuatu.',
    'Saya lebih menikmati tugas nyata daripada pembahasan yang sangat abstrak.',
    'Saya tertarik pada kegiatan lapangan atau luar ruangan.',
    'Saya nyaman belajar melalui percobaan langsung.',
    'Saya menyukai tugas yang menghasilkan benda atau hasil yang terlihat.',
  ],
  I: [
    'Saya menikmati mencari penyebab dari sebuah masalah.',
    'Saya tertarik melakukan eksperimen untuk menguji ide.',
    'Saya suka membaca informasi untuk menjawab rasa penasaran.',
    'Saya menikmati soal yang membutuhkan analisis mendalam.',
    'Saya tertarik mengamati pola dan menarik kesimpulan.',
    'Saya suka membandingkan beberapa sumber sebelum mengambil keputusan.',
    'Saya menikmati diskusi tentang ilmu pengetahuan dan teknologi.',
  ],
  A: [
    'Saya menikmati mengekspresikan ide melalui tulisan, gambar, musik, atau desain.',
    'Saya suka menemukan cara baru untuk menyelesaikan tugas.',
    'Saya tertarik membuat karya yang memiliki gaya pribadi.',
    'Saya menikmati kegiatan yang memberi ruang untuk berimajinasi.',
    'Saya suka memperhatikan warna, bentuk, cerita, atau komposisi.',
    'Saya tertarik mengikuti kegiatan seni atau kreatif.',
    'Saya menikmati mengembangkan ide yang tidak biasa.',
  ],
  S: [
    'Saya senang membantu teman memahami pelajaran.',
    'Saya menikmati kegiatan yang membuat orang lain merasa didukung.',
    'Saya nyaman mendengarkan cerita atau masalah orang lain.',
    'Saya suka bekerja dalam kegiatan pelayanan atau sosial.',
    'Saya menikmati menjelaskan sesuatu kepada kelompok.',
    'Saya tertarik pada cara manusia belajar dan berkembang.',
    'Saya merasa bersemangat ketika bisa memberi dampak positif bagi orang lain.',
  ],
  E: [
    'Saya menikmati mengajak orang lain mendukung sebuah ide.',
    'Saya tertarik memimpin kegiatan atau proyek.',
    'Saya percaya diri menyampaikan pendapat di depan kelompok.',
    'Saya menikmati membuat keputusan ketika bekerja bersama tim.',
    'Saya tertarik memulai kegiatan atau usaha baru.',
    'Saya suka menyusun strategi untuk mencapai hasil.',
    'Saya menikmati bernegosiasi dan membangun kesepakatan.',
  ],
  C: [
    'Saya menyukai tugas yang memiliki langkah dan aturan yang jelas.',
    'Saya menikmati menyusun data atau informasi agar rapi.',
    'Saya terbiasa memeriksa kembali detail pekerjaan.',
    'Saya suka membuat jadwal dan daftar tugas.',
    'Saya nyaman bekerja dengan tabel, angka, atau dokumen.',
    'Saya menikmati menjaga catatan agar mudah ditemukan kembali.',
    'Saya menyukai pekerjaan yang membutuhkan ketelitian dan konsistensi.',
  ],
};

export const riasecItems = Object.entries(riasecStatements).flatMap(([category, statements]) =>
  statements.map((text, index) => ({
    id: `${category.toLowerCase()}${index + 1}`,
    category: category as RiasecCategory,
    text,
  })),
);

export const varkLabels: Record<VarkCategory, string> = {
  V: 'Visual',
  A: 'Aural',
  R: 'Read/write',
  K: 'Kinesthetic',
};

const option = (category: VarkCategory, text: string) => ({ category, text });

export const varkItems = [
  {
    id: 'vark1',
    text: 'Saat mempelajari topik baru, saya paling terbantu ketika...',
    options: [
      option('V', 'melihat diagram atau peta konsep'),
      option('A', 'mendengarkan penjelasan dan berdiskusi'),
      option('R', 'membaca catatan atau rangkuman'),
      option('K', 'mencoba contoh atau praktik langsung'),
    ],
  },
  {
    id: 'vark2',
    text: 'Ketika harus mengingat petunjuk menuju tempat baru, saya memilih...',
    options: [
      option('V', 'melihat peta'),
      option('A', 'mendengar arahan seseorang'),
      option('R', 'membaca daftar petunjuk'),
      option('K', 'mencoba rutenya sambil berjalan'),
    ],
  },
  {
    id: 'vark3',
    text: 'Untuk memahami proses yang rumit, saya biasanya...',
    options: [
      option('V', 'menggambar alur proses'),
      option('A', 'membicarakannya dengan orang lain'),
      option('R', 'menulis ulang langkah-langkahnya'),
      option('K', 'mencoba menjalankan proses tersebut'),
    ],
  },
  {
    id: 'vark4',
    text: 'Saat mempersiapkan presentasi, saya paling nyaman...',
    options: [
      option('V', 'menata slide dan visual'),
      option('A', 'berlatih mengucapkan materi'),
      option('R', 'menulis naskah dan poin penting'),
      option('K', 'berlatih langsung di depan ruangan'),
    ],
  },
  {
    id: 'vark5',
    text: 'Saat belajar untuk ujian, saya cenderung...',
    options: [
      option('V', 'membuat mind map berwarna'),
      option('A', 'menjelaskan materi dengan suara keras'),
      option('R', 'membuat rangkuman tertulis'),
      option('K', 'mengerjakan banyak latihan soal'),
    ],
  },
  {
    id: 'vark6',
    text: 'Jika perangkat baru tidak langsung saya pahami, saya akan...',
    options: [
      option('V', 'melihat gambar bagian-bagiannya'),
      option('A', 'meminta seseorang menjelaskan'),
      option('R', 'membaca panduan'),
      option('K', 'mencoba tombol dan fiturnya'),
    ],
  },
  {
    id: 'vark7',
    text: 'Dalam diskusi kelompok, saya paling mudah mengikuti ketika...',
    options: [
      option('V', 'ide ditulis dalam diagram'),
      option('A', 'setiap orang menyampaikan pendapat'),
      option('R', 'ada catatan hasil diskusi'),
      option('K', 'kelompok mengerjakan contoh bersama'),
    ],
  },
  {
    id: 'vark8',
    text: 'Ketika membaca cerita, bagian yang paling membantu saya memahami adalah...',
    options: [
      option('V', 'ilustrasi dan gambaran tempat'),
      option('A', 'dialog dan suara tokoh yang saya bayangkan'),
      option('R', 'susunan kalimat dan deskripsi tertulis'),
      option('K', 'pengalaman tokoh yang bisa saya hubungkan dengan kehidupan nyata'),
    ],
  },
  {
    id: 'vark9',
    text: 'Saat guru memberi tugas proyek, saya ingin terlebih dahulu...',
    options: [
      option('V', 'melihat contoh hasil akhirnya'),
      option('A', 'mendengarkan penjelasan tujuan proyek'),
      option('R', 'membaca rubrik dan instruksi'),
      option('K', 'langsung mencoba membuat bagian awal'),
    ],
  },
  {
    id: 'vark10',
    text: 'Jika saya salah menjawab soal, saya paling terbantu dengan...',
    options: [
      option('V', 'penanda visual pada bagian yang salah'),
      option('A', 'penjelasan lisan dari guru atau teman'),
      option('R', 'catatan koreksi tertulis'),
      option('K', 'mengerjakan ulang soal serupa'),
    ],
  },
  {
    id: 'vark11',
    text: 'Untuk mengingat kosakata baru, saya memilih...',
    options: [
      option('V', 'menghubungkannya dengan gambar'),
      option('A', 'mengucapkannya berulang kali'),
      option('R', 'menuliskannya dalam daftar'),
      option('K', 'menggunakannya dalam percakapan atau aktivitas'),
    ],
  },
  {
    id: 'vark12',
    text: 'Ketika menonton materi pembelajaran, saya paling memperhatikan...',
    options: [
      option('V', 'animasi dan tampilan visual'),
      option('A', 'narasi dan percakapan'),
      option('R', 'subtitle dan teks penjelas'),
      option('K', 'demonstrasi cara melakukan sesuatu'),
    ],
  },
  {
    id: 'vark13',
    text: 'Saat merencanakan kegiatan, saya lebih suka...',
    options: [
      option('V', 'melihat kalender atau timeline'),
      option('A', 'membicarakan rencana bersama tim'),
      option('R', 'membuat daftar langkah tertulis'),
      option('K', 'melakukan simulasi atau uji coba'),
    ],
  },
  {
    id: 'vark14',
    text: 'Jika harus menjelaskan ide kepada teman, saya biasanya...',
    options: [
      option('V', 'menggambar atau menunjukkan visual'),
      option('A', 'menjelaskan dengan percakapan'),
      option('R', 'menulis pesan yang terstruktur'),
      option('K', 'memberikan contoh langsung'),
    ],
  },
  {
    id: 'vark15',
    text: 'Saat merasa kesulitan memahami pelajaran, saya akan...',
    options: [
      option('V', 'mencari video atau infografik'),
      option('A', 'bertanya dan berdiskusi'),
      option('R', 'mencari buku atau artikel lain'),
      option('K', 'mencari eksperimen atau latihan praktik'),
    ],
  },
  {
    id: 'vark16',
    text: 'Saya merasa paling yakin sudah memahami materi ketika...',
    options: [
      option('V', 'bisa menggambarkan hubungan antarkonsep'),
      option('A', 'bisa menjelaskannya secara lisan'),
      option('R', 'bisa menuliskan rangkuman dengan kata sendiri'),
      option('K', 'bisa menerapkannya pada situasi nyata'),
    ],
  },
];

export function scoreRiasec(answers: Record<string, number>) {
  const scores = Object.fromEntries(Object.keys(riasecLabels).map((category) => [category, 0])) as Record<RiasecCategory, number>;
  for (const item of riasecItems) scores[item.category] += answers[item.id] ?? 0;
  const dominant = Object.entries(scores)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 3)
    .map(([category]) => ({ category: category as RiasecCategory, label: riasecLabels[category as RiasecCategory] }));
  return { scores, dominant };
}

export function scoreVark(answers: Record<string, VarkCategory>) {
  const scores = Object.fromEntries(Object.keys(varkLabels).map((category) => [category, 0])) as Record<VarkCategory, number>;
  for (const category of Object.values(answers)) scores[category] += 1;
  const dominantCategory = Object.entries(scores).sort(([, left], [, right]) => right - left)[0][0] as VarkCategory;
  return { scores, dominant: { category: dominantCategory, label: varkLabels[dominantCategory] } };
}
