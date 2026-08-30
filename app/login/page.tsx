'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned.');

      // 2. Admin direct bypass
      if (cleanEmail === 'info@globalsaleselite.com') {
        router.push('/admin/dashboard');
        return;
      }

      // 3. Resilient profile lookup (handles missing or duplicate profiles cleanly)
      let { data: profile } = await supabase
        .from('profiles')
        .select('id, role, is_approved')
        .eq('id', data.user.id)
        .maybeSingle();

      // Fallback: check by email if profile ID wasn't linked properly
      if (!profile) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('id, role, is_approved')
          .eq('email', cleanEmail)
          .maybeSingle();
        profile = profileByEmail;
      }

      if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      // 4. Check approval status (defaults to true if profile record is missing or already verified)
      if (profile && profile.is_approved === false) {
        await supabase.auth.signOut();
        setErrorMsg('Your account is pending admin approval. You will gain access once confirmed.');
        setLoading(false);
        return;
      }

      // 5. Successful login
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-[#121620] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Agent Portal</h1>
          <p className="text-xs text-slate-500">Sign in to access your downline network and payouts</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B4A] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B4A] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF6B4A]/25 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#FF6B4A] hover:underline font-bold">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}