'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  // Checkout State
  const [step, setStep] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  // 20-Minute Countdown Timer
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return alert('Please fill in all required fields.');
    }
    setStep(2);
    setTimeLeft(20 * 60);
  };

  const handleInstantSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return alert('Please upload your payment receipt or transfer proof.');

    setSubmitting(true);
    try {
      // 1. Upload proof receipt to Supabase Storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 2. Resolve Sponsor ID if referral code was supplied
      let resolvedSponsorId: string | null = null;
      if (referralCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id')
          .or(`referral_code.eq.${referralCode.trim()},id.eq.${referralCode.trim()}`)
          .single();

        if (sponsor) resolvedSponsorId = sponsor.id;
      }

      // 3. Create Supabase Auth Account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        // 4. Update user profile with sponsor, phone, and receipt
        await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone_number: phone,
            referred_by: resolvedSponsorId,
            avatar_url: publicUrl,
          })
          .eq('id', userId);

        // 5. Record verification entry for admin reference
        await supabase
          .from('registration_requests')
          .insert({
            full_name: fullName,
            email,
            password: 'PROCESSED_INSTANT',
            phone_number: phone,
            referred_by: referralCode || null,
            amount: 5000,
            proof_url: publicUrl,
            status: 'approved',
          });
      }

      alert('Registration successful! Redirecting to your dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white dark:bg-[#121620] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {step === 1 ? 'Step 1: Agent Registration' : 'Step 2: Bank Settlement'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1 ? 'Enter your details & sponsor code' : 'Complete ₦5,000 fee within 20 mins'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#FF6B4A]/10 text-[#FF6B4A] px-3 py-1 rounded-full">
            Step {step} of 2
          </span>
        </div>

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Sponsor Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Sponsor code if referred"
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-600 dark:text-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-[#FF6B4A]/25 mt-2"
            >
              Continue to ₦5,000 Payment &rarr;
            </button>
          </form>
        )}

        {/* STEP 2: BANK DETAILS, 20-MIN TIMER & PROOF UPLOAD */}
        {step === 2 && (
          <form onSubmit={handleInstantSignup} className="space-y-5">
            {/* 20-Minute Countdown Display */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex justify-between items-center text-amber-600 dark:text-amber-400">
              <div>
                <span className="text-[10px] uppercase font-bold block">Payment Window</span>
                <p className="text-xs">Complete transfer before time expires</p>
              </div>
              <div className="text-2xl font-black font-mono">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Official Bank Account Details Box */}
            <div className="bg-slate-50 dark:bg-[#0B0E14] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Transfer Exactly ₦5,000 To:</span>
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs text-slate-500">Bank:</span>
                <strong className="text-xs text-slate-900 dark:text-white">GTBank (Guaranty Trust Bank)</strong>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs text-slate-500">Account Number:</span>
                <code className="text-sm font-mono font-bold text-[#FF6B4A]">3005320529</code>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Account Name:</span>
                <strong className="text-xs text-slate-900 dark:text-white">GLOBAL SALES ELITE</strong>
              </div>
            </div>

            {/* Upload Receipt / Proof */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Upload Payment Screenshot / Receipt *
              </label>
              <input
                type="file"
                required
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FF6B4A] file:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs transition"
              >
                &larr; Back
              </button>

              <button
                type="submit"
                disabled={submitting || timeLeft <= 0}
                className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 shadow-lg shadow-[#FF6B4A]/25"
              >
                {submitting ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-xs font-bold text-slate-500">
          Loading registration secure portal...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}