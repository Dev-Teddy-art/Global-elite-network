'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
    router.push('/login');
  };

  // Strictly check if the active user is the admin
  const isAdmin = user?.email === 'info@globalsaleselite.com';

  return (
    <header className="sticky top-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto bg-[#121620]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/logo1.png" 
            alt="Global Sales Elite Logo" 
            width={100} 
            height={24} 
            className="w-auto h-auto object-contain"
            priority
          />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {/* Admin Portal link renders ONLY if logged into info@globalsaleselite.com */}
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
      </div>
    </header>
  );
}