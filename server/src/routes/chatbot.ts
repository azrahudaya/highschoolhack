import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/auth';
import { createRateLimit } from '../middleware/rate-limit';
import { containsSensitiveStudentData } from '../utils/sensitive-data';

const router = Router();

const messageSchema = z.object({
  message: z.string().trim().min(2).max(800),
  topic: z.enum(['adaptasi', 'potensi', 'belajar', 'target', 'akademik', 'finansial']).optional(),
});

const chatbotRateLimit = createRateLimit({
  key: (req) => req.user?.id ?? req.ip ?? 'anonymous',
  max: 12,
  windowMs: 60_000,
  message: 'Terlalu banyak pesan dalam waktu singkat. Tunggu sebentar sebelum bertanya lagi.',
});

function fallbackAnswer(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('adaptasi') || lower.includes('teman')) {
    return 'Mulai dari satu langkah kecil: kenali rutinitas sekolah, pilih satu teman diskusi, dan catat tantangan yang paling sering muncul. Jika terasa berat terus-menerus, bicarakan dengan Guru BK.';
  }
  if (lower.includes('belajar') || lower.includes('nilai')) {
    return 'Coba buat jadwal belajar 30-45 menit per sesi, mulai dari materi paling sulit, lalu tutup dengan 5 menit refleksi: apa yang sudah paham dan apa yang perlu ditanyakan.';
  }
  if (lower.includes('jurusan') || lower.includes('karier')) {
    return 'Bandingkan minat, mata pelajaran kuat, contoh pekerjaan, dan kegiatan yang membuatmu betah belajar. Diskusikan 2-3 opsi dengan Guru BK atau alumni sebelum memilih.';
  }
  if (lower.includes('uang') || lower.includes('finansial')) {
    return 'Pisahkan kebutuhan, keinginan, dan tabungan. Untuk rencana setelah lulus, mulai catat perkiraan biaya kos, makan, transport, belajar, dan dana darurat.';
  }
  return 'Aku bisa membantu dengan topik adaptasi SMA, potensi diri, gaya belajar, target pengembangan, motivasi belajar, dan perencanaan akademik. Tulis pertanyaan umum tanpa NISN, email, atau data pribadi.';
}

router.post(
  '/message',
  requireAuth,
  chatbotRateLimit,
  asyncHandler(async (req, res) => {
    const payload = messageSchema.parse(req.body);

    if (containsSensitiveStudentData(payload.message)) {
      res.status(400).json({
        error: 'SensitiveData',
        message: 'Jangan kirim NISN, email, nomor telepon, atau data pribadi ke chatbot. Tulis ulang pertanyaan secara umum.',
      });
      return;
    }

    if (!env.DEEPSEEK_API_KEY) {
      res.json({ answer: fallbackAnswer(payload.message), provider: 'fallback' });
      return;
    }

    const response = await fetch(`${env.DEEPSEEK_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL,
        thinking: { type: 'disabled' },
        temperature: 0.2,
        max_tokens: 420,
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah chatbot pendamping belajar HighschoolHack untuk siswa SMA Indonesia. Jawab singkat, praktis, suportif, dan aman. Jangan meminta data pribadi. Jangan bertindak sebagai konselor krisis, psikolog, dokter, atau penasihat hukum/keuangan profesional. Untuk masalah berat, arahkan siswa bicara dengan Guru BK, orang tua, atau layanan darurat setempat.',
          },
          {
            role: 'user',
            content: payload.message,
          },
        ],
      }),
    });

    if (!response.ok) {
      res.json({ answer: fallbackAnswer(payload.message), provider: 'fallback' });
      return;
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim();
    res.json({ answer: answer || fallbackAnswer(payload.message), provider: 'deepseek' });
  }),
);

export const chatbotRouter = router;
