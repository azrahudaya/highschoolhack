import { Bot, LoaderCircle, Send, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const quickPrompts = [
  'Aku sulit adaptasi di SMA, harus mulai dari mana?',
  'Bagaimana cara menentukan target belajar minggu ini?',
  'Cara belajar apa yang cocok kalau aku cepat bosan?',
  'Apa yang harus aku diskusikan dengan Guru BK?',
];

function hasSensitiveData(value: string) {
  return /\b\d{10,}\b/.test(value) || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
}

export function StudentChatbot() {
  const [open, setOpen] = useState(false);
  const [consented, setConsented] = useState(() => (typeof window === 'undefined' ? false : window.localStorage.getItem('hsh-chatbot-ai-consent') === 'accepted'));
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Tanya hal umum tentang adaptasi SMA, potensi diri, gaya belajar, target pengembangan, atau rencana akademik. Jangan kirim NISN, email, nomor telepon, atau data pribadi.',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || sending) return;
    if (hasSensitiveData(message)) {
      setError('Jangan kirim NISN, email, nomor telepon, atau data pribadi ke chatbot.');
      return;
    }

    setError('');
    setSending(true);
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');

    try {
      const response = await api<{ answer: string; provider: string }>('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chatbot belum bisa menjawab.');
    } finally {
      setSending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function acceptConsent() {
    window.localStorage.setItem('hsh-chatbot-ai-consent', 'accepted');
    setConsented(true);
  }

  return (
    <div className="no-print fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-200 bg-[#101b3f] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-[#ffe08a]" />
              <div>
                <h2 className="text-sm font-semibold">Chatbot BK</h2>
                <p className="text-xs text-white/55">Q&A umum, bukan konselor darurat</p>
              </div>
            </div>
            <button className="grid size-8 place-items-center rounded-lg hover:bg-white/10" onClick={() => setOpen(false)} title="Tutup chatbot" type="button"><X className="size-4" /></button>
          </header>
          {!consented ? (
            <div className="flex flex-1 flex-col justify-between bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-[#101b3f]">Setujui batasan chatbot AI</p>
                <div className="mt-3 space-y-3 text-xs leading-6 text-slate-600">
                  <p>Chatbot ini dapat memakai DeepSeek melalui server HighschoolHack untuk menjawab pertanyaan umum.</p>
                  <p>Jangan tulis NISN, email, nomor telepon, alamat, nama lengkap orang lain, atau data pribadi.</p>
                  <p>Chatbot bukan konselor darurat. Untuk masalah berat, hubungi Guru BK, orang tua/wali, atau bantuan darurat setempat.</p>
                </div>
              </div>
              <button className="mt-5 h-11 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" onClick={acceptConsent} type="button">Saya paham dan lanjut</button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                {messages.map((message, index) => (
                  <div className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${message.role === 'assistant' ? 'bg-white text-slate-700 shadow-sm' : 'ml-auto bg-[#101b3f] text-white'}`} key={`${message.role}-${index}`}>
                    {message.content}
                  </div>
                ))}
                {sending && <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm"><LoaderCircle className="size-4 animate-spin" /> Menjawab...</div>}
              </div>
              <div className="border-t border-slate-200 bg-white p-3">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {quickPrompts.map((prompt) => (
                    <button className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-violet-300" key={prompt} onClick={() => void sendMessage(prompt)} type="button">
                      {prompt}
                    </button>
                  ))}
                </div>
                {error && <p aria-live="polite" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</p>}
                <form className="flex gap-2" onSubmit={submit}>
                  <input className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500" onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaan umum..." value={input} />
                  <button className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#101b3f] text-white disabled:opacity-50" disabled={sending || !input.trim()} title="Kirim" type="submit"><Send className="size-4" /></button>
                </form>
              </div>
            </>
          )}
        </section>
      )}
      <button className="grid size-12 place-items-center rounded-full bg-[#101b3f] text-white shadow-xl hover:bg-[#22346a]" onClick={() => setOpen((current) => !current)} title="Buka Chatbot BK" type="button">
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </button>
    </div>
  );
}
