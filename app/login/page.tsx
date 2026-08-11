'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr || !data.user) {
      setError(authErr?.message || 'Invalid login credentials.');
      setLoading(false);
      return;
    }

    // Check user role to redirect appropriately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#121620]/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800/80 space-y-4 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Login To Your Account</h1>
        {error && <p className="text-xs text-[#E05244] bg-[#0B0E14] p-3 rounded-xl border border-slate-800">{error}</p>}

        <div>
          <label className="text-xs text-slate-400 font-medium">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mt-1.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E05244] transition"
            placeholder="agent@globalsaleselite.com"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mt-1.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E05244] transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#E05244] hover:bg-[#c94336] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-[#E05244]/20 mt-2"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-4">
          Need an account?{' '}
          <Link href="/signup" className="text-[#E05244] hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}