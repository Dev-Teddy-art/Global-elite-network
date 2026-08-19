'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push('/login');
  };

  const isAdmin = user?.email === 'info@globalsaleselite.com';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 transition-all">
      <div className="max-w-6xl mx-auto bg-white/80 dark:bg-[#121620]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl px-5 py-3 flex justify-between items-center shadow-xl shadow-slate-200/50 dark:shadow-black/40">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <Image 
            src="/logo1.png" 
            alt="Global Sales Elite Logo" 
            width={100} 
            height={24} 
            className="w-auto h-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] border border-slate-200 dark:border-slate-700 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
            >
              ⚡ Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link href="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-[#FF6B4A] dark:hover:text-white transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold px-4 py-2 rounded-xl transition border border-slate-200 dark:border-slate-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 dark:text-slate-300 hover:text-[#FF6B4A] dark:hover:text-white transition">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#FF6B4A] hover:bg-[#e05638] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-[#FF6B4A]/25"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl flex flex-col text-sm font-medium">
          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              onClick={() => setMenuOpen(false)}
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-center font-bold py-2 rounded-xl text-xs"
            >
              ⚡ Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link 
                href="/dashboard" 
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 text-center border-b border-slate-100 dark:border-slate-800/60"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 text-center border-b border-slate-100 dark:border-slate-800/60"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setMenuOpen(false)}
                className="bg-[#FF6B4A] hover:bg-[#e05638] text-white font-semibold py-2.5 rounded-xl text-xs text-center transition shadow-lg shadow-[#FF6B4A]/25"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}