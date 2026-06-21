import PDFDocument from 'pdfkit';

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
  ink: '#172033',
  muted: '#555f6f',
  line: '#d6d6d6',
  border: '#9ca3af',
  note: '#eef2ff',
  white: '#ffffff',
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
  return value.toLocaleDateString('id-ID');
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
      ? 'Buat target dana darurat minimal Rp500.000.'
      : 'Dana darurat sudah mulai membantu, tetap isi ulang setelah dipakai.',
    'Bandingkan biaya hidup antar kota sebelum menentukan tujuan.',
    'Diskusi dengan guru BK atau orang tua soal rencana setelah lulus.',
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

function finalStatus(data: Record<string, unknown>, finalBalance: number) {
  const stored = asText(data.status, '');
  if (stored) return stored;
  if (finalBalance < 0) return 'Defisit';
  const readiness = metricFromData(data, 'readinessScore');
  if (readiness >= 90) return 'Sangat Siap';
  if (readiness >= 75) return 'Siap';
  if (readiness >= 60) return 'Cukup Siap';
  if (readiness >= 40) return 'Perlu Persiapan';
  return 'Risiko Tinggi';
}

export async function createFutureReadyBoardPdf(input: FutureReadyBoardPdfInput) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 52,
    compress: false,
    info: {
      Title: 'Laporan Future Ready Board',
      Author: 'HighschoolHack',
      Subject: 'Smart Financial report',
    },
  });

  const chunks: Buffer[] = [];
  const pdfReady = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const data = input.data;
  const contentX = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const pageBottom = () => doc.page.height - doc.page.margins.bottom;
  const labelWidth = 178;
  const valueX = contentX + labelWidth + 18;
  const valueWidth = contentWidth - labelWidth - 18;

  function drawPageBorder() {
    doc.save();
    doc.lineWidth(0.8).strokeColor(colors.border).rect(20, 8, doc.page.width - 40, doc.page.height - 16).stroke();
    doc.restore();
  }

  function resetCursor(y = doc.y) {
    doc.x = contentX;
    doc.y = y;
  }

  function addPage() {
    doc.addPage();
    drawPageBorder();
    resetCursor(doc.page.margins.top);
  }

  function ensureSpace(height: number) {
    if (doc.y + height > pageBottom()) addPage();
  }

  function sectionTitle(title: string) {
    ensureSpace(31);
    resetCursor();
    doc.moveTo(contentX, doc.y).lineTo(contentX + contentWidth, doc.y).lineWidth(0.8).strokeColor(colors.line).stroke();
    doc.y += 12;
    doc.font('Helvetica-Bold').fontSize(11.5).fillColor(colors.ink).text(title, contentX, doc.y, { width: contentWidth });
    doc.y += 8;
    resetCursor();
  }

  function row(label: string, value: string) {
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted);
    const labelHeight = doc.heightOfString(label, { width: labelWidth });
    doc.font('Helvetica').fontSize(8).fillColor(colors.ink);
    const valueHeight = doc.heightOfString(value, { width: valueWidth });
    const height = Math.max(labelHeight, valueHeight) + 4;
    ensureSpace(height);
    const y = doc.y;
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text(label, contentX, y, { width: labelWidth });
    doc.font('Helvetica').fontSize(8).fillColor(colors.ink).text(value, valueX, y, { width: valueWidth, align: 'right' });
    resetCursor(y + height);
  }

  function noteBox(text: string) {
    const paddingX = 8;
    const paddingY = 8;
    const bodyWidth = contentWidth - paddingX * 2;
    doc.font('Helvetica').fontSize(8).fillColor(colors.ink);
    const textHeight = doc.heightOfString(text, { width: bodyWidth, lineGap: 1 });
    const height = textHeight + paddingY * 2;
    ensureSpace(height + 12);
    const y = doc.y;
    doc.save();
    doc.rect(contentX, y, contentWidth, height).fill(colors.note);
    doc.restore();
    doc.font('Helvetica').fontSize(8).fillColor(colors.ink).text(text, contentX + paddingX, y + paddingY, { width: bodyWidth, lineGap: 1 });
    resetCursor(y + height + 12);
  }

  function bulletList(title: string, items: string[]) {
    sectionTitle(title);
    items.filter(Boolean).forEach((item) => {
      const text = `- ${item}`;
      doc.font('Helvetica').fontSize(8).fillColor(colors.ink);
      const height = doc.heightOfString(text, { width: contentWidth, lineGap: 1 }) + 2;
      ensureSpace(height);
      doc.text(text, contentX, doc.y, { width: contentWidth, lineGap: 1 });
      resetCursor(doc.y + 2);
    });
    doc.y += 10;
    resetCursor();
  }

  drawPageBorder();
  resetCursor(38);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(colors.ink).text('Laporan Future Ready Board', contentX, doc.y, { width: contentWidth });
  doc.moveDown(0.35);
  doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text('Coba dulu sebelum boncos beneran.', contentX, doc.y, { width: contentWidth });
  doc.y += 29;
  resetCursor();

  const targetParts = [
    asText(data.afterGraduationTarget, ''),
    asText(data.interestArea, ''),
  ].filter(Boolean);
  const finalBalance = metricFromData(data, 'finalBalance');
  const status = finalStatus(data, finalBalance);
  const finalDecision = asText(
    data.finalDecision,
    'Kamu belum gagal, cuma perlu strategi yang lebih aman. Mulai dari cek pengeluaran besar dan cari bantuan yang cocok.',
  );

  sectionTitle('Profil Simulasi');
  row('Nama panggilan', asText(data.nickname, input.student.name));
  row('Sekolah', asText(data.schoolSnapshot, input.student.schoolName));
  row('Kelas', asText(data.classSnapshot, input.student.className ?? '-'));
  row('Tanggal simulasi', dateLabel(input.generatedAt));
  row('Kota tujuan', asText(data.destinationCity, input.city?.city ?? '-'));
  row('Target setelah lulus', targetParts.length ? targetParts.join(' - ') : '-');
  doc.y += 10;

  sectionTitle('Ringkasan Biaya Hidup');
  row('Kos sederhana', input.city ? currency(input.city.housing) : '-');
  row('Makan sederhana', input.city ? `${currency(input.city.food)} / bulan` : '-');
  row('Transport harian', input.city ? currency(input.city.transport) : '-');
  row('Estimasi hidup hemat', input.monthlyCost ? `${currency(input.monthlyCost)} / bulan` : '-');
  doc.y += 10;

  sectionTitle('Hasil Akhir');
  row('Saldo akhir', currency(finalBalance));
  row('Dana darurat', currency(data.emergencyFund));
  row('Risk score', String(metricFromData(data, 'riskScore')));
  row('Decision score', String(metricFromData(data, 'decisionScore')));
  row('Lives tersisa', String(metricFromData(data, 'lives')));
  row('Status akhir', status);
  row('Badge', asText(data.badge, '-'));
  noteBox(finalDecision);

  bulletList('Rekomendasi Aksi', collectRecommendations(data, input.monthlyCost));

  bulletList(
    'Beasiswa yang Bisa Dicek',
    input.scholarships.map((scholarship) => `${scholarship.name} (${scholarship.type})`),
  );

  noteBox('Catatan edukatif: hasil ini adalah simulasi belajar, bukan penilaian pribadi. Masa depan nggak harus mahal, tapi perlu direncanakan.');

  doc.end();
  return pdfReady;
}
