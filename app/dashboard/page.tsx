'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [approvedSalesCount, setApprovedSalesCount] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);
  
  const [level1Users, setLevel1Users] = useState<any[]>([]);
  const [level2Users, setLevel2Users] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (prof) {
      setProfile(prof);
      setPhone(prof.phone_number || '');
      setDob(prof.date_of_birth || '');
      setBankName(prof.bank_name || '');
      setAccountNumber(prof.account_number || '');
      setAccountName(prof.account_name || '');

      const { count } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'approved');

      setApprovedSalesCount(count || 0);

      const { data: comms } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id);

      const total = comms?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setTotalCommissions(total);

      const { data: l1 } = await supabase
        .from('profiles')
        .select('id, full_name, email, referral_code')
        .eq('referred_by', user.id);

      setLevel1Users(l1 || []);

      if (l1 && l1.length > 0) {
        const l1Ids = l1.map((u) => u.id);
        const { data: l2 } = await supabase
          .from('profiles')
          .select('id, full_name, email, referral_code')
          .in('referred_by', l1Ids);

        setLevel2Users(l2 || []);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { data: updatedProf, error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      setProfile(updatedProf);
      alert('Profile picture updated successfully!');
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: updatedProf, error } = await supabase
      .from('profiles')
      .update({
        phone_number: phone,
        date_of_birth: dob,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (!error && updatedProf) {
      setProfile(updatedProf);
      alert('Account settings updated successfully!');
    } else {
      alert(`Update failed: ${error?.message || 'Error saving changes'}`);
    }
    setSavingProfile(false);
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('sales').insert({
      seller_id: user?.id,
      amount: Number(amount),
      description,
      status: 'pending',
    });

    if (!error) {
      alert('Sale logged successfully! Awaiting admin approval.');
      setAmount('');
      setDescription('');
    } else {
      alert(`Failed to log sale: ${error.message}`);
    }
    setLoading(false);
  };

  const copyShareLink = () => {
    if (!profile?.referral_code) return;
    const shareUrl = `${window.location.origin}/signup?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Profile Summary Card */}
      <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#E05244]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-white text-xl">
                {profile?.full_name?.[0] || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-white uppercase">{profile?.full_name || 'Agent'}</h1>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-2 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500">Your Sponsor Referral Code</span>
            <div className="flex items-center gap-3">
              <code className="text-sm font-mono font-bold text-[#E05244] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                {profile?.referral_code || '...'}
              </code>
              <button
                onClick={copyShareLink}
                className="bg-[#E05244] hover:bg-[#c94336] text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Profile Data Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-slate-800/80 pt-4 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Phone</p>
            <p className="text-slate-200 font-semibold mt-0.5">{profile?.phone_number || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Date of Birth</p>
            <p className="text-slate-200 font-semibold mt-0.5">{profile?.date_of_birth || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Bank Name</p>
            <p className="text-slate-200 font-semibold mt-0.5">{profile?.bank_name || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Account Name</p>
            <p className="text-slate-200 font-semibold mt-0.5">{profile?.account_name || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Account Number</p>
            <p className="text-slate-200 font-semibold mt-0.5">{profile?.account_number || 'Not Set'}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121620]/80 p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Earned Commissions</p>
          <p className="text-3xl font-black text-emerald-400">₦{totalCommissions.toLocaleString()}</p>
        </div>

        <div className="bg-[#121620]/80 p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Approved Sales</p>
          <p className="text-3xl font-black text-white">{approvedSalesCount}</p>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">Account & Payout Settings</h2>
        
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Bank Name</label>
            <input
              type="text"
              placeholder="e.g. GTBank / Zenith"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Account Name</label>
            <input
              type="text"
              placeholder="Name on bank account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Account Number</label>
            <input
              type="text"
              placeholder="10-digit Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Photo (Upload from device)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E05244] file:text-white hover:file:bg-[#c94336] transition cursor-pointer"
            />
            {uploadingImage && <p className="text-[10px] text-amber-400 mt-1">Uploading image to server...</p>}
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-[#E05244] hover:bg-[#c94336] text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-[#E05244]/20"
            >
              {savingProfile ? 'Saving Details...' : 'Save Account Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Log Sale Form */}
      <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">Log New Sale for Approval</h2>

        <form onSubmit={handleLogSale} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Sale Amount (₦)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 10000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#E05244] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Description</label>
            <textarea
              placeholder="Property description or transaction details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#E05244] transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E05244] hover:bg-[#c94336] text-white font-bold py-4 rounded-xl text-sm transition"
          >
            {loading ? 'Logging Sale...' : 'Log Sale'}
          </button>
        </form>
      </div>
    </div>
  );
}