const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?62|0)\s*8(?:[\s.-]?\d){7,11}\b/;
const longContinuousNumberPattern = /\b\d{10,}\b/;
const sensitivePhrasePattern = /\b(nisn|nik|nomor\s+induk|no\.?\s*(hp|telepon|wa)|nomor\s+(hp|telepon|whatsapp|wa)|whatsapp|tanggal\s+lahir|tgl\s+lahir|alamat\s+(rumah|saya)|rumah\s+saya|saya\s+tinggal\s+di|nama\s+lengkap)\b/i;

export function hasSensitiveStudentData(value: string) {
  return emailPattern.test(value)
    || phonePattern.test(value)
    || longContinuousNumberPattern.test(value)
    || sensitivePhrasePattern.test(value);
}
