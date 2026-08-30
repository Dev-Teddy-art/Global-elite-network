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
  
  const [userSales, setUserSales] = useState<any[]>([]);
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

    // 1. Fetch profile with maybeSingle() to avoid JSON coercion crashes
    let { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Fallback lookup by email if ID not matched
    if (!prof && user.email) {
      const { data: profByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      prof = profByEmail;
    }

    if (prof) {
      setProfile(prof);
      setPhone(prof.phone_number || '');
      setDob(prof.date_of_birth || '');
      setBankName(prof.bank_name || '');
      setAccountNumber(prof.account_number || '');
      setAccountName(prof.account_name || '');

      // Approved sales count
      const { count } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'approved');

      setApprovedSalesCount(count || 0);

      // Total user sales list
      const { data: salesList } = await supabase
        .from('sales')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      setUserSales(salesList || []);

      // Total earned commissions
      const { data: comms } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id);

      const totalEarned = comms?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setTotalCommissions(totalEarned);

      // Level 1 Referrals
      const { data: l1 } = await supabase
        .from('profiles')
        .select('id, full_name, email, referral_code, created_at')
        .or(`referred_by.eq.${user.id},referred_by.eq.${prof.referral_code}`);

      setLevel1Users(l1 || []);

      // Level 2 Referrals
      if (l1 && l1.length > 0) {
        const l1Ids = l1.map((u) => u.id).filter(Boolean);
        const l1Codes = l1.map((u) => u.referral_code).filter(Boolean);

        const filterQueries = [
          ...l1Ids.map((id) => `referred_by.eq.${id}`),
          ...l1Codes.map((code) => `referred_by.eq.${code}`)
        ].join(',');

        if (filterQueries) {
          const { data: l2 } = await supabase
            .from('profiles')
            .select('id, full_name, email, referral_code, referred_by, created_at')
            .or(filterQueries);

          setLevel2Users(l2 || []);
        }
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

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      setProfile((prev: any) => ({ ...(prev || {}), avatar_url: publicUrl }));
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('User session expired. Please sign in again.');
        return;
      }

      const updates = {
        phone_number: phone,
        date_of_birth: dob,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({
        ...(prev || {}),
        ...updates,
      }));

      alert('Account & Payout settings updated successfully!');
    } catch (err: any) {
      alert(`Update failed: ${err.message || 'Error saving changes'}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSalePayload = {
        seller_id: user.id,
        amount: Number(amount),
        description,
        status: 'pending',
      };

      const { data: newSale, error } = await supabase
        .from('sales')
        .insert(newSalePayload)
        .select()
        .maybeSingle();

      if (error) throw error;

      alert('Sale logged successfully! Awaiting admin verification and commission payout.');
      setAmount('');
      setDescription('');
      if (newSale) {
        setUserSales((prev) => [newSale, ...prev]);
      }
    } catch (err: any) {
      alert(`Failed to log sale: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white dark:bg-[#121620]/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6B4A]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-white text-xl">
                {profile?.full_name?.[0] || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{profile?.full_name || 'Agent'}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0B0E14] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500">Your Sponsor Referral Code</span>
            <div className="flex items-center gap-3">
              <code className="text-sm font-mono font-bold text-[#FF6B4A] bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {profile?.referral_code || '...'}
              </code>
              <button
                onClick={copyShareLink}
                className="bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Profile Data Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Phone</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{profile?.phone_number || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Date of Birth</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{profile?.date_of_birth || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Bank Name</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{profile?.bank_name || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Account Name</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{profile?.account_name || 'Not Set'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Account Number</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{profile?.account_number || 'Not Set'}</p>
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#121620]/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Earned Commissions</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₦{totalCommissions.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Commissions settled directly to your registered bank account</p>
        </div>

        <div className="bg-white dark:bg-[#121620]/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Approved Closed Sales</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{approvedSalesCount}</p>
          <p className="text-xs text-slate-500">Total verified transactions in your network</p>
        </div>
      </div>

      {/* MY REFERRALS BINARY NETWORK TREE */}
      <div className="bg-white dark:bg-[#121620]/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Referral Network</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hierarchical visual structure of your direct (L1) and downline (L2) network.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
            Direct Team: {level1Users.length}
          </span>
        </div>

        {/* Tree Canvas */}
        <div className="bg-slate-50 dark:bg-[#0B0E14] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto min-h-[350px] flex items-center justify-center">
          <div className="min-w-[650px] flex flex-col items-center py-4">
            
            {/* LEVEL 0: ROOT NODE */}
            <div className="flex flex-col items-center relative">
              <div className="bg-white dark:bg-[#121620] border-2 border-[#FF6B4A] px-6 py-2.5 rounded-2xl text-center shadow-xl z-10 w-56">
                <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">ROOT LEG</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile?.full_name || 'YOU'}</p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{profile?.email}</p>
              </div>
              
              {level1Users.length > 0 && (
                <div className="w-0.5 h-6 bg-gradient-to-b from-[#FF6B4A] to-slate-400 dark:to-slate-700"></div>
              )}
            </div>

            {/* LEVEL 1: DIRECT REFERRALS */}
            {level1Users.length > 0 ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-3/4 flex justify-between items-center">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-700"></div>
                </div>

                <div className="w-full grid grid-cols-2 gap-8 pt-4">
                  {level1Users.map((l1) => {
                    const directSubDownlines = level2Users.filter((l2) => {
                      const ref = l2.referred_by?.trim().toLowerCase();
                      return ref === l1.id?.trim().toLowerCase() || ref === l1.referral_code?.trim().toLowerCase();
                    });

                    return (
                      <div key={l1.id} className="flex flex-col items-center">
                        <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-center shadow-lg w-60 space-y-1 relative z-10">
                          <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Level 1
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{l1.full_name || 'Agent'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{l1.email}</p>
                          <code className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 inline-block mt-1">
                            {l1.referral_code}
                          </code>
                        </div>

                        {directSubDownlines.length > 0 && (
                          <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700"></div>
                        )}

                        {/* LEVEL 2: SUB-REFERRALS */}
                        {directSubDownlines.length > 0 && (
                          <div className="w-full flex flex-col items-center">
                            {directSubDownlines.length > 1 && (
                              <div className="w-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
                              {directSubDownlines.map((l2) => (
                                <div key={l2.id} className="bg-white dark:bg-[#121620]/90 border border-slate-200 dark:border-slate-800/80 p-2 rounded-xl text-center shadow-sm">
                                  <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 block">L2 Leg</span>
                                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">{l2.full_name || 'Sub-Agent'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">No direct team members found yet.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mx-auto">Share your sponsor referral link above to start building your 2-leg downline network.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Sale Form */}
      <div className="bg-white dark:bg-[#121620]/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log New Sale for Approval</h2>

        <form onSubmit={handleLogSale} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Sale Amount (₦)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 10000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B4A] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Description</label>
            <textarea
              placeholder="Property description or transaction details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B4A] transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-4 rounded-xl text-sm transition"
          >
            {loading ? 'Logging Sale...' : 'Log Sale'}
          </button>
        </form>
      </div>

      {/* RECENT LOGGED SALES HISTORY */}
      <div className="bg-white dark:bg-[#121620]/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Logged Sales History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track all property sales you have submitted for admin review.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
            Total Logged: {userSales.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {userSales.length > 0 ? (
            userSales.map((sale) => (
              <div key={sale.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.description || 'Property Sale'}</p>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">₦{Number(sale.amount).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Logged on {new Date(sale.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  {sale.status === 'approved' && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">
                      ✓ Approved
                    </span>
                  )}
                  {sale.status === 'pending' && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full">
                      ⏳ Pending Approval
                    </span>
                  )}
                  {sale.status === 'rejected' && (
                    <span className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold px-3 py-1 rounded-full">
                      ✕ Rejected
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">You have not submitted any sales for approval yet.</p>
          )}
        </div>
      </div>

      {/* Account & Bank Settings Form */}
      <div className="bg-white dark:bg-[#121620]/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account & Bank Settings</h2>
        
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Preferred Bank Name</label>
            <input
              type="text"
              placeholder="e.g. GTBank / Zenith / Opay"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Account Name</label>
            <input
              type="text"
              placeholder="Name on bank account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Account Number</label>
            <input
              type="text"
              placeholder="10-digit Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Profile Photo (Upload from device)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FF6B4A] file:text-white hover:file:bg-[#e05638] transition cursor-pointer"
            />
            {uploadingImage && <p className="text-[10px] text-amber-500 mt-1">Uploading image to server...</p>}
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-[#FF6B4A]/20 disabled:opacity-50"
            >
              {savingProfile ? 'Saving Details...' : 'Save Account Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}