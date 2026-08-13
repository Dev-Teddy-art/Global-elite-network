'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Check initial active session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getInitialSession();

    // 2. Listen to real-time auth changes (Login/Logout)
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

  // Strictly check if the active user is the admin
  const isAdmin = user?.email === 'info@globalsaleselite.com';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto bg-[#121620]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl px-5 py-3 flex justify-between items-center shadow-2xl">
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
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md"
            >
              ⚡ Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition border border-slate-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white transition">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#E05244] hover:bg-[#c94336] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-[#E05244]/20"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none"
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

      {/* Mobile Drawer Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto bg-[#121620] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl flex flex-col text-sm font-medium">
          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              onClick={() => setMenuOpen(false)}
              className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-center font-bold py-2 rounded-xl text-xs"
            >
              ⚡ Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link 
                href="/dashboard" 
                onClick={() => setMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2 text-center border-b border-slate-800/60"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition border border-slate-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                onClick={() => setMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2 text-center border-b border-slate-800/60"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setMenuOpen(false)}
                className="bg-[#E05244] hover:bg-[#c94336] text-white font-semibold py-2.5 rounded-xl text-xs text-center transition shadow-lg shadow-[#E05244]/20"
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