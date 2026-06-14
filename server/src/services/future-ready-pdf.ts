import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

type CityCost = {
  city: string;
  housing: number;
  food: number;
  transport: number;
  study: number;
};

type Scholarship = {
  name: string;
  type: string;
  url: string;
  description: string;
};

type FutureReadyBoardPdfInput = {
  student: {
    name: string;
    nisn: string | null;
    schoolName: string;
    className: string | null;
  };
  generatedAt: Date;
  data: Record<string, unknown>;
  city: CityCost | undefined;
  monthlyCost: number;
  scholarships: Scholarship[];
  portfolioUrl: string;
};

const colors = {
  navy: '#101b3f',
  ink: '#172033',
  muted: '#64748b',
  pale: '#f7f9fd',
  line: '#dbe3ef',
  amber: '#f59e0b',
  amberSoft: '#fff7df',
  green: '#087f5b',
  greenSoft: '#eafaf3',
  red: '#b42318',
  redSoft: '#fff1f0',
  violet: '#5b21b6',
  violetSoft: '#f3efff',
};

function asText(value: unknown, fallback = '-') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return fallback;
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function currency(value: unknown) {
  const numeric = asNumber(value);
  const sign = numeric < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(numeric).toLocaleString('id-ID')}`;
}

function dateLabel(value: Date) {
  return value.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function statusColor(status: string, finalBalance: number) {
  if (finalBalance < 0 || status.toLowerCase().includes('defisit')) return colors.red;
  if (status.toLowerCase().includes('siap')) return colors.green;
  return colors.amber;
}

function metricFromData(data: Record<string, unknown>, key: string, fallback = 0) {
  const value = asNumber(data[key]);
  return Number.isFinite(value) ? value : fallback;
}

function buildFallbackRecommendations(data: Record<string, unknown>, monthlyCost: number) {
  const finalBalance = metricFromData(data, 'finalBalance');
  const riskScore = metricFromData(data, 'riskScore');
  const emergencyFund = metricFromData(data, 'emergencyFund');
  const emergencyRatio = monthlyCost ? Math.round((emergencyFund / monthlyCost) * 100) : 0;
  return [
    finalBalance < 0
      ? 'Kurangi biaya tetap seperti kos, makan, atau transport sebelum memilih kota tujuan.'
      : 'Pertahankan biaya tetap dan catat pengeluaran mingguan.',
    riskScore > 35
      ? 'Hindari paylater dan keputusan spontan untuk kebutuhan konsumtif.'
      : 'Simpan pola keputusan yang sudah realistis.',
    emergencyRatio < 50
      ? 'Naikkan dana darurat bertahap sebelum hidup mandiri.'
      : 'Dana darurat sudah mulai membantu, tetap isi ulang setelah dipakai.',
    'Cek KIP Kuliah, beasiswa kampus, dan bantuan pendidikan yang sesuai kondisi keluarga.',
    'Diskusikan rencana akhir dengan Guru BK atau orang tua/wali.',
  ];
}

function collectRecommendations(data: Record<string, unknown>, monthlyCost: number) {
  const authored = [
    asText(data.academicRecommendation, ''),
    asText(data.careerRecommendation, ''),
    asText(data.financialRecommendation, ''),
    asText(data.socialRecommendation, ''),
  ].filter(Boolean);
  return authored.length ? authored : buildFallbackRecommendations(data, monthlyCost);
}

export async function createFutureReadyBoardPdf(input: FutureReadyBoardPdfInput) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 42,
    compress: false,
    info: {
      Title: 'Future Ready Board Portfolio',
      Author: 'HighschoolHack',
      Subject: 'Smart Financial portfolio report',
    },
  });

  const chunks: Buffer[] = [];
  const pdfReady = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  let pageNumber = 1;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const pageBottom = () => doc.page.height - doc.page.margins.bottom - 24;

  function footer() {
    const y = pageBottom() + 10;
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted)
      .text('HighschoolHack - Future Ready Board', doc.page.margins.left, y, { width: contentWidth / 2, lineBreak: false });
    doc.text(`Halaman ${pageNumber}`, doc.page.margins.left + contentWidth / 2, y, { width: contentWidth / 2, align: 'right', lineBreak: false });
  }

  function addPage() {
    footer();
    doc.addPage();
    pageNumber += 1;
    doc.y = doc.page.margins.top;
  }

  function ensureSpace(height: number) {
    if (doc.y + height > pageBottom()) addPage();
  }

  function sectionTitle(title: string, subtitle?: string) {
    ensureSpace(subtitle ? 50 : 34);
    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.ink).text(title);
    if (subtitle) {
      doc.moveDown(0.15);
      doc.font('Helvetica').fontSize(9.5).fillColor(colors.muted).text(subtitle, { lineGap: 2 });
    }
    doc.moveDown(0.7);
  }

  function card(x: number, y: number, width: number, height: number, fill = '#ffffff', stroke = colors.line) {
    doc.save();
    doc.roundedRect(x, y, width, height, 8).fillAndStroke(fill, stroke);
    doc.restore();
  }

  function metricCards(items: Array<{ label: string; value: string; note?: string; tint?: string }>, columns = 3) {
    const gap = 10;
    const cardWidth = (contentWidth - gap * (columns - 1)) / columns;
    const height = 82;
    let x = doc.page.margins.left;
    let y = doc.y;

    items.forEach((item, index) => {
      if (index > 0 && index % columns === 0) {
        x = doc.page.margins.left;
        y += height + gap;
      }
      ensureSpace(height + gap);
      card(x, y, cardWidth, height, item.tint ?? '#ffffff');
      doc.font('Helvetica').fontSize(8.5).fillColor(colors.muted).text(item.label, x + 14, y + 13, { width: cardWidth - 28 });
      doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.ink).text(item.value, x + 14, y + 32, { width: cardWidth - 28, lineGap: 1 });
      if (item.note) {
        doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text(item.note, x + 14, y + 58, { width: cardWidth - 28 });
      }
      x += cardWidth + gap;
    });

    const rowCount = Math.ceil(items.length / columns);
    doc.y = y + height + gap + (rowCount > 1 ? 0 : 4);
  }

  function textCard(title: string, body: string, fill = '#ffffff', accent = colors.navy) {
    const width = contentWidth;
    const bodyWidth = width - 32;
    const measureX = doc.x;
    const measureY = doc.y;
    const bodyHeight = doc.font('Helvetica').fontSize(10).heightOfString(body, { width: bodyWidth, lineGap: 2 });
    doc.x = measureX;
    doc.y = measureY;
    const height = Math.max(86, 48 + bodyHeight);
    ensureSpace(height + 12);
    const x = doc.page.margins.left;
    const y = doc.y;
    card(x, y, width, height, fill);
    doc.rect(x, y, 5, height).fill(accent);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.ink).text(title, x + 16, y + 14, { width: bodyWidth });
    doc.font('Helvetica').fontSize(10).fillColor(colors.ink).text(body, x + 16, y + 36, { width: bodyWidth, lineGap: 2 });
    doc.y = y + height + 12;
  }

  function bulletList(title: string, items: string[], fill = '#ffffff') {
    const body = items.filter(Boolean).map((item) => `- ${item}`).join('\n');
    textCard(title, body || '-', fill, colors.green);
  }

  function costTable() {
    const rows = [
      ['Kos/tempat tinggal', input.city ? currency(input.city.housing) : '-'],
      ['Makan', input.city ? currency(input.city.food) : '-'],
      ['Transport', input.city ? currency(input.city.transport) : '-'],
      ['Belajar/lainnya', input.city ? currency(input.city.study) : '-'],
      ['Estimasi hidup hemat per bulan', input.monthlyCost ? currency(input.monthlyCost) : '-'],
    ];
    const height = 184;
    ensureSpace(height + 12);
    const x = doc.page.margins.left;
    const y = doc.y;
    card(x, y, contentWidth, height, '#ffffff');
    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.ink).text('Ringkasan Biaya Hidup', x + 18, y + 16);
    let rowY = y + 45;
    rows.forEach(([label, value], index) => {
      if (index === rows.length - 1) {
        doc.roundedRect(x + 14, rowY - 5, contentWidth - 28, 28, 6).fill(colors.amberSoft);
      }
      doc.font(index === rows.length - 1 ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(colors.ink)
        .text(label, x + 20, rowY, { width: contentWidth - 170 });
      doc.font(index === rows.length - 1 ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(index === rows.length - 1 ? colors.amber : colors.ink)
        .text(value, x + contentWidth - 160, rowY, { width: 136, align: 'right' });
      rowY += 26;
    });
    doc.y = y + height + 12;
  }

  async function qrCard() {
    const qrDataUrl = await QRCode.toDataURL(input.portfolioUrl, { margin: 1, width: 132 });
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1] ?? '', 'base64');
    const height = 126;
    ensureSpace(height + 12);
    const x = doc.page.margins.left;
    const y = doc.y;
    card(x, y, contentWidth, height, colors.pale);
    doc.image(qrBuffer, x + 16, y + 16, { width: 86, height: 86 });
    doc.font('Helvetica-Bold').fontSize(13).fillColor(colors.ink).text('Portfolio digital', x + 122, y + 22, { width: contentWidth - 150 });
    doc.font('Helvetica').fontSize(10).fillColor(colors.muted)
      .text('Scan QR untuk membuka halaman portfolio siswa di HighschoolHack. Link ini tetap membutuhkan login agar data siswa tidak terbuka publik.', x + 122, y + 46, { width: contentWidth - 150, lineGap: 2 });
    doc.font('Helvetica').fontSize(8.5).fillColor(colors.violet).text(input.portfolioUrl, x + 122, y + 91, { width: contentWidth - 150 });
    doc.y = y + height + 12;
  }

  const data = input.data;
  const readiness = metricFromData(data, 'readinessScore');
  const finalBalance = metricFromData(data, 'finalBalance');
  const status = asText(data.status, finalBalance < 0 ? 'Defisit' : readiness >= 75 ? 'Siap terkendali' : readiness >= 50 ? 'Waspada' : 'Perlu strategi ulang');
  const badge = asText(data.badge, '-');
  const scoreColor = statusColor(status, finalBalance);
  const finalDecision = asText(data.finalDecision, 'Rencana perlu dicek ulang bersama Guru BK atau orang tua/wali sebelum mengambil keputusan akhir.');

  doc.rect(0, 0, doc.page.width, 190).fill(colors.navy);
  doc.rect(0, 185, doc.page.width, 5).fill(colors.amber);
  doc.font('Helvetica-Bold').fontSize(29).fillColor('#ffffff')
    .text('Future Ready Board', 42, 44, { width: 340 });
  doc.font('Helvetica').fontSize(11).fillColor('#d7e1f2')
    .text('Laporan kesiapan finansial Kelas XII', 42, 84, { width: 330 });
  doc.font('Helvetica').fontSize(9.5).fillColor('#b8c4da')
    .text('Coba dulu sebelum boncos beneran. Simulasi ini membantu siswa menimbang biaya, risiko, beasiswa, dan keputusan setelah lulus.', 42, 110, { width: 335, lineGap: 3 });

  doc.roundedRect(414, 42, 132, 108, 12).fill('#ffffff');
  doc.font('Helvetica').fontSize(8.5).fillColor(colors.muted).text('Skor kesiapan', 432, 58, { width: 96, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(38).fillColor(scoreColor).text(String(readiness), 432, 72, { width: 96, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.ink).text(status, 424, 118, { width: 112, align: 'center' });

  doc.y = 214;
  metricCards([
    { label: 'Nama siswa', value: input.student.name, note: input.student.nisn ? `NISN ${input.student.nisn}` : 'Portfolio pribadi' },
    { label: 'Sekolah', value: input.student.schoolName, note: input.student.className ?? '-' },
    { label: 'Tanggal cetak', value: dateLabel(input.generatedAt), note: 'Generated by HighschoolHack' },
  ], 3);

  sectionTitle('Profil Simulasi', 'Data dasar yang dipakai untuk menghitung kesiapan finansial.');
  metricCards([
    { label: 'Target setelah lulus', value: asText(data.afterGraduationTarget), tint: colors.pale },
    { label: 'Kota tujuan', value: asText(data.destinationCity), tint: colors.pale },
    { label: 'Strategi tinggal', value: asText(data.livingStrategy), tint: colors.pale },
    { label: 'Uang saku per bulan', value: currency(data.monthlyAllowance), tint: colors.violetSoft },
    { label: 'Tabungan saat ini', value: currency(data.currentSavings), tint: colors.violetSoft },
    { label: 'Dana darurat', value: currency(data.emergencyFund), tint: colors.violetSoft },
  ], 3);

  if (asText(data.financialConcern, '') || asText(data.costNotes, '')) {
    textCard('Catatan kekhawatiran dan biaya', [
      asText(data.financialConcern, ''),
      asText(data.costNotes, ''),
    ].filter(Boolean).join('\n'), colors.pale, colors.violet);
  }

  costTable();

  sectionTitle('Hasil Future Ready Board', 'Ringkasan skor dari keputusan 12 langkah, emergency card, dan rencana menabung.');
  metricCards([
    { label: 'Saldo akhir simulasi', value: currency(finalBalance), note: finalBalance < 0 ? 'Perlu strategi ulang' : 'Masih terkendali', tint: finalBalance < 0 ? colors.redSoft : colors.greenSoft },
    { label: 'Decision score', value: String(metricFromData(data, 'decisionScore')), note: 'Kualitas pilihan di board', tint: colors.pale },
    { label: 'Risk score', value: String(metricFromData(data, 'riskScore')), note: 'Semakin kecil semakin aman', tint: colors.pale },
    { label: 'Lives tersisa', value: String(metricFromData(data, 'lives')), note: 'Dampak risiko simulasi', tint: colors.pale },
    { label: 'Rencana menabung', value: currency(data.monthlySavingPlan), note: 'Target per bulan', tint: colors.amberSoft },
    { label: 'Badge', value: badge, note: 'Hasil belajar siswa', tint: colors.greenSoft },
  ], 3);

  textCard('Rekomendasi keputusan akhir', finalDecision, finalBalance < 0 ? colors.redSoft : colors.greenSoft, scoreColor);
  bulletList('Rekomendasi aksi berikutnya', collectRecommendations(data, input.monthlyCost), colors.pale);

  if (asText(data.simulationReflection, '')) {
    textCard('Refleksi siswa', asText(data.simulationReflection), '#ffffff', colors.amber);
  }

  sectionTitle('Beasiswa yang Bisa Dicek', 'Referensi awal. Siswa tetap perlu mengecek syarat, jadwal, dan dokumen pada situs resmi.');
  input.scholarships.forEach((scholarship) => {
    const body = `${scholarship.type}\n${scholarship.description}\n${scholarship.url}`;
    textCard(scholarship.name, body, '#ffffff', colors.amber);
  });

  textCard(
    'Kesimpulan',
    'Hasil ini adalah simulasi belajar, bukan penilaian pribadi dan bukan nasihat keuangan profesional. Gunakan laporan ini sebagai bahan diskusi dengan Guru BK, orang tua/wali, dan pihak sekolah sebelum mengambil keputusan besar setelah lulus.',
    colors.pale,
    colors.navy,
  );

  await qrCard();
  footer();
  doc.end();

  return pdfReady;
}
