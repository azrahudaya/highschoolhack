import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

const labels = {
  student: 'Dashboard Siswa',
  teacher: 'Dashboard Guru BK',
  admin: 'Dashboard Admin Sekolah',
};

export function PortalPage({ area }: { area: keyof typeof labels }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('Memeriksa akses server...');

  useEffect(() => {
    api<{ area: string }>(`/api/protected/${area}`)
      .then((response) => setApiStatus(`Role guard server aktif untuk area ${response.area}.`))
      .catch((error: Error) => setApiStatus(error.message));
  }, [area]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a className="flex items-center gap-2 font-semibold text-[#101b3f]" href="/">
            <Sparkles className="size-5" aria-hidden="true" />
            HighschoolHack
          </a>
          <button
            className="grid size-10 place-items-center rounded-lg border border-slate-300 text-slate-700 hover:border-slate-400"
            onClick={handleLogout}
            title="Keluar"
            type="button"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#5b21b6]">Phase 0C protected shell</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#101b3f]">{labels[area]}</h1>
        <p className="mt-2 text-slate-600">Halo, {user?.name ?? user?.email}.</p>
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-950">Protected route terhubung</p>
              <p className="mt-1 text-sm text-emerald-700">{apiStatus}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
