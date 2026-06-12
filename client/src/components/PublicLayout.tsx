import { Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth, getUserHomePath } from '../contexts/AuthContext';
import { Brand } from './Brand';

const navItems = [
  ['Program', '/programs/bekal-10'],
  ['Artikel', '/articles'],
  ['Tentang Kami', '/about'],
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-6">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {navItems.map(([label, path]) => (
              <NavLink className={({ isActive }) => (isActive ? 'text-[#5b21b6]' : 'hover:text-slate-950')} key={path} to={path}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to={user ? getUserHomePath(user) : '/login'}>
              {user ? 'Dashboard' : 'Masuk'}
            </Link>
            {!user && (
              <Link className="rounded-lg bg-[#15224a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#22346a]" to="/register">
                Mulai
              </Link>
            )}
          </div>
          <button
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map(([label, path]) => (
                <Link className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100" key={path} onClick={() => setOpen(false)} to={path}>
                  {label}
                </Link>
              ))}
              <Link className="mt-2 rounded-lg bg-[#15224a] px-3 py-3 text-center text-sm font-semibold text-white" onClick={() => setOpen(false)} to={user ? getUserHomePath(user) : '/login'}>
                {user ? 'Buka Dashboard' : 'Masuk'}
              </Link>
            </div>
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-[#101b3f] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Brand inverse />
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              Platform pendamping siswa SMA untuk mengenali potensi, merencanakan masa depan, dan mempersiapkan kehidupan setelah lulus.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Program</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              <Link to="/programs/bekal-10">Bekal 10</Link>
              <Link to="/programs/setting-goal">Setting Goal</Link>
              <Link to="/programs/smart-financial">Smart Financial</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">HighschoolHack</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              <Link to="/articles">Artikel</Link>
              <Link to="/about">Tentang Kami</Link>
              <Link to="/login">Masuk</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/45">
          HighschoolHack. Asesmen digunakan untuk eksplorasi diri, bukan diagnosis psikologis.
        </div>
      </footer>
    </div>
  );
}
