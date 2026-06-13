type TextOptions = {
  bold?: boolean;
  size?: number;
};

function cleanText(value: unknown) {
  return String(value ?? '-')
    .replace(/Rp\s*/g, 'Rp ')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || '-';
}

function escapePdf(value: string) {
  return cleanText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(value: string, maxChars: number) {
  const words = cleanText(value).split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function currency(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value) || 0;
  const sign = numeric < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(numeric).toLocaleString('id-ID')}`;
}

export function createSimplePdf(lines: Array<{ text: string; options?: TextOptions }>) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;
  const content: string[] = [
    'q',
    '0.96 0.97 1 rg',
    `0 0 ${pageWidth} ${pageHeight} re f`,
    '0.06 0.10 0.23 rg',
    `0 ${pageHeight - 118} ${pageWidth} 118 re f`,
    'Q',
  ];
  let y = pageHeight - margin;

  function addText(text: string, options: TextOptions = {}) {
    const font = options.bold ? 'F2' : 'F1';
    const size = options.size ?? 11;
    const maxChars = size >= 20 ? 38 : size >= 14 ? 56 : 78;
    for (const line of wrapText(text, maxChars)) {
      content.push('BT');
      content.push(`/${font} ${size} Tf`);
      content.push(options.size && options.size >= 20 ? '1 1 1 rg' : '0.09 0.13 0.20 rg');
      content.push(`1 0 0 1 ${margin} ${y} Tm`);
      content.push(`(${escapePdf(line)}) Tj`);
      content.push('ET');
      y -= size + 7;
    }
  }

  for (const item of lines) {
    if (y < 64) break;
    if (!item.text) {
      y -= 10;
      continue;
    }
    addText(item.text, item.options);
  }

  const stream = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}
