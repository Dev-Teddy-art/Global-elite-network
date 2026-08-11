'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [refCode, setRefCode] = useState(searchParams.get('ref') || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Verify Referral Code via Server API
    const verifyRes = await fetch('/api/verify-ref', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.valid) {
      setError(verifyData.message || 'Invalid referral code.');
      setLoading(false);
      return;
    }

    // 2. Create User Profile via Server API
    const signupRes = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName,
        sponsorId: verifyData.sponsorId,
      }),
    });

    const signupData = await signupRes.json();

    if (!signupRes.ok || !signupData.success) {
      setError(signupData.error || 'Registration failed.');
      setLoading(false);
      return;
    }

    alert('Account created successfully!');
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSignUp} className="w-full max-w-md bg-[#121620]/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800/80 space-y-4 shadow-2xl">
      <h1 className="text-2xl font-bold text-white">Become A Global Sales Elite</h1>
      {error && <p className="text-xs text-[#E05244] bg-[#0B0E14] p-3 rounded-xl border border-slate-800">{error}</p>}
      
      <div>
        <label className="text-xs text-slate-400 font-medium">Sponsor Referral Code *</label>
        <input
          type="text"
          required
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          className="w-full p-3 mt-1.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E05244] transition"
          placeholder="e.g. GLOBALSALESADMIN100"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mt-1.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E05244] transition"
          placeholder="John Doe"
        />
      </div>

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
        className="w-full py-3.5 bg-[#E05244] hover:bg-[#c94336] text-white font-bold rounded-xl transition shadow-lg shadow-[#E05244]/20 mt-2"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      <p className="text-xs text-slate-400 text-center mt-4">
        Already registered?{' '}
        <Link href="/login" className="text-[#E05244] hover:underline font-semibold">
          Log in here
        </Link>
      </p>
    </form>
  );
}

export default function SignUp() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 font-medium text-sm">Loading registration...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}