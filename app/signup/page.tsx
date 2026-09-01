'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ⚙️ TOGGLE REGISTRATION FEE:
// Set to false for free testing registrations.
// Set to true to enforce the ₦5,000 GTBank payment + proof upload.
const REQUIRE_PAYMENT = false;

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (step !== 2 || timeLeft <= 0 || !REQUIRE_PAYMENT) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const registerUser = async (receiptUrl: string | null) => {
    setSubmitting(true);
    try {
      const cleanName = fullName.trim();
      const cleanEmail = email.trim().toLowerCase();

      // 1. Resolve Sponsor ID if referral code was provided
      let resolvedSponsorId: string | null = null;
      if (referralCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id')
          .or(`referral_code.eq.${referralCode.trim()},id.eq.${referralCode.trim()}`)
          .maybeSingle();

        if (sponsor) resolvedSponsorId = sponsor.id;
      }

      // 2. Create Auth User with user_metadata populated
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        // 3. Upsert into profiles directly
        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: cleanEmail,
              full_name: cleanName,
              phone_number: phone.trim(),
              referred_by: resolvedSponsorId,
              is_approved: false,
              role: 'agent',
              ...(receiptUrl ? { avatar_url: receiptUrl } : {}),
            },
            { onConflict: 'id' }
          );

        // 4. Create registration audit record
        await supabase
          .from('registration_requests')
          .insert({
            full_name: cleanName,
            email: cleanEmail,
            password: 'REGISTERED_PENDING_APPROVAL',
            phone_number: phone.trim(),
            referred_by: referralCode.trim() || null,
            amount: REQUIRE_PAYMENT ? 5000 : 0,
            proof_url: receiptUrl || 'FREE_PROMO_REGISTRATION',
            status: 'pending',
          });
      }

      // 5. Sign out and notify user to await approval
      await supabase.auth.signOut();

      alert(
        'Registration submitted successfully! Your account is currently pending admin verification. You will be able to log in once activated.'
      );
      router.push('/login');
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return alert('Please fill in all required fields.');
    }

    if (!REQUIRE_PAYMENT) {
      await registerUser(null);
    } else {
      setStep(2);
      setTimeLeft(20 * 60);
    }
  };

  const handlePaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return alert('Please upload your payment receipt or transfer proof.');

    setSubmitting(true);
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await registerUser(publicUrl);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="bg-white dark:bg-[#121620] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {REQUIRE_PAYMENT && step === 2 ? 'Step 2: Bank Settlement' : 'Agent Registration'}
            </h1>
            <p className="text-xs text-slate-500">
              {REQUIRE_PAYMENT 
                ? (step === 1 ? 'Enter your details & sponsor code' : 'Complete ₦5,000 fee within 20 mins') 
                : 'Registration subject to admin activation'}
            </p>
          </div>
          {REQUIRE_PAYMENT && (
            <span className="text-xs font-mono font-bold bg-[#FF6B4A]/10 text-[#FF6B4A] px-3 py-1 rounded-full">
              Step {step} of 2
            </span>
          )}
        </div>

        {step === 1 && (
          <form onSubmit={handleStepOneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Nancy Ugwah"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 pr-11 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs p-1 focus:outline-none transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
              disabled={submitting}
              className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-[#FF6B4A]/25 mt-2 disabled:opacity-50"
            >
              {submitting
                ? 'Submitting Registration...'
                : REQUIRE_PAYMENT
                ? 'Continue to ₦5,000 Payment →'
                : 'Submit Registration for Admin Approval →'}
            </button>
          </form>
        )}

        {REQUIRE_PAYMENT && step === 2 && (
          <form onSubmit={handlePaidSubmit} className="space-y-5">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex justify-between items-center text-amber-600 dark:text-amber-400">
              <div>
                <span className="text-[10px] uppercase font-bold block">Payment Window</span>
                <p className="text-xs">Complete transfer before time expires</p>
              </div>
              <div className="text-2xl font-black font-mono">
                {formatTimer(timeLeft)}
              </div>
            </div>

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
                ← Back
              </button>

              <button
                type="submit"
                disabled={submitting || timeLeft <= 0}
                className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 shadow-lg shadow-[#FF6B4A]/25"
              >
                {submitting ? 'Submitting...' : 'Complete Registration'}
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
          Loading registration portal...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}