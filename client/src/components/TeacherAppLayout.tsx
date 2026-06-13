import { BarChart3, Lightbulb, LogOut, Menu, UsersRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { icon: BarChart3, label: 'Ringkasan', path: '/teacher' },
  { icon: UsersRound, label: 'Monitoring siswa', path: '/teacher/students' },
];

export function TeacherAppLayout({ children, title = 'Dashboard Guru BK' }: { children: ReactNode; title?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const school = user?.memberships.find((membership) => membership.role === 'teacher_bk')?.school.name ?? 'Sekolah';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return <div className="min-h-screen bg-[#f4f7fb] text-slate-950 lg:grid lg:grid-cols-[15.5rem_1fr]">
    {menuOpen && <button aria-label="Tutup menu" className="no-print fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMenuOpen(false)} type="button" />}
    <aside className={`no-print fixed inset-y-0 left-0 z-50 w-64 bg-[#101b3f] p-4 text-white transition-transform lg:static lg:w-auto lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Link className="flex items-center gap-2 font-semibold" to="/"><Lightbulb className="size-5 text-[#ffe08a]" /> HighschoolHack</Link><button className="grid size-9 place-items-center lg:hidden" onClick={() => setMenuOpen(false)} type="button"><X className="size-5" /></button></div>
      <nav className="mt-9 space-y-1 text-sm">{links.map(({ icon: Icon, label, path }) => {
        const active = path === '/teacher' ? location.pathname === path : location.pathname.startsWith(path);
        return <Link className={`flex items-center gap-3 rounded-lg px-3 py-3 ${active ? 'bg-white/12 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`} key={path} onClick={() => setMenuOpen(false)} to={path}><Icon className="size-4" />{label}</Link>;
      })}</nav>
      <div className="absolute bottom-5 left-4 right-4 rounded-lg bg-white/8 p-3"><p className="text-xs text-white/50">Sekolah aktif</p><p className="mt-1 truncate text-sm font-semibold">{school}</p></div>
    </aside>
    <main className="min-w-0"><header className="no-print flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7"><div className="flex min-w-0 items-center gap-3"><button className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 lg:hidden" onClick={() => setMenuOpen(true)} type="button"><Menu className="size-5" /></button><div><p className="text-xs text-slate-500">Guru BK</p><p className="truncate text-sm font-semibold text-[#101b3f]">{title}</p></div></div><button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600" onClick={handleLogout} title="Keluar" type="button"><LogOut className="size-4" /></button></header>{children}</main>
  </div>;
}
