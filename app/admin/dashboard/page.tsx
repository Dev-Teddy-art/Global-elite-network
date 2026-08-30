'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [registrationProofs, setRegistrationProofs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Approval & Receipt Preview State
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    verifyAndLoadAdminData();
  }, []);

  const verifyAndLoadAdminData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'info@globalsaleselite.com') {
      router.push('/dashboard');
      return;
    }

    // 1. Pending Sales
    const { data: sales } = await supabase
      .from('sales')
      .select('id, amount, description, created_at, seller_id, profiles(full_name, email, bank_name, account_number, account_name)')
      .eq('status', 'pending');

    setPendingSales(sales || []);

    // 2. Registration Payment Proofs
    const { data: proofs } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    setRegistrationProofs(proofs || []);

    // 3. User Directory
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
      
    setUsers(allUsers || []);
  };

  const handleApproveUser = async (email: string, requestId: string) => {
    setApprovingEmail(email);
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, requestId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`User ${email} is approved and can now log in!`);
        setRegistrationProofs((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
        );
        setUsers((prev) =>
          prev.map((u) => (u.email === email ? { ...u, is_approved: true } : u))
        );
      } else {
        alert(`Approval error: ${data.error}`);
      }
    } catch (err) {
      alert('Network error approving user.');
    } finally {
      setApprovingEmail(null);
    }
  };

  const handleFlagFakeReceipt = async (requestId: string, userEmail: string) => {
    if (!confirm(`Flag this receipt as FAKE? This will mark it rejected in the audit log.`)) {
      return;
    }

    const { error } = await supabase
      .from('registration_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) {
      alert('Receipt flagged as FAKE and rejected.');
      setRegistrationProofs((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
      );
    } else {
      alert(`Error updating: ${error.message}`);
    }
  };

  const handleApproveSale = async (saleId: string) => {
    setLoadingId(saleId);
    try {
      const res = await fetch('/api/admin/approve-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Sale approved! 15% and 3% commissions credited.');
        setPendingSales((prev) => prev.filter((s) => s.id !== saleId));
      } else {
        alert(`Approval failed: ${data.error}`);
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this pending sale? This cannot be undone.')) {
      return;
    }

    setDeletingSaleId(saleId);
    try {
      const res = await fetch('/api/admin/delete-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Pending sale removed.');
        setPendingSales((prev) => prev.filter((s) => s.id !== saleId));
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setDeletingSaleId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName || 'N/A'}" permanently?`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('User deleted.');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSponsorInfo = (referredBy: string) => {
    if (!referredBy) return 'Direct Sign-up (No Sponsor)';
    const cleanRef = referredBy.trim().toLowerCase();
    const sponsor = users.find(
      (u) => u.id?.toLowerCase() === cleanRef || u.referral_code?.toLowerCase() === cleanRef
    );
    return sponsor ? `${sponsor.full_name || 'User'} (${sponsor.referral_code})` : referredBy;
  };

  const getLevel1ForUser = (userObj: any) => {
    if (!userObj) return [];
    return users.filter((u) => {
      if (!u.referred_by) return false;
      const ref = u.referred_by.trim().toLowerCase();
      return ref === userObj.referral_code?.trim().toLowerCase() || ref === userObj.id?.trim().toLowerCase();
    });
  };

  const getLevel2ForUser = (l1Users: any[]) => {
    if (!l1Users || l1Users.length === 0) return [];
    const l1Ids = l1Users.map((u) => u.id?.trim().toLowerCase());
    const l1Codes = l1Users.map((u) => u.referral_code?.trim().toLowerCase());

    return users.filter((u) => {
      if (!u.referred_by) return false;
      const ref = u.referred_by.trim().toLowerCase();
      return l1Ids.includes(ref) || l1Codes.includes(ref);
    });
  };

  const modalL1 = selectedUser ? getLevel1ForUser(selectedUser) : [];
  const modalL2 = selectedUser ? getLevel2ForUser(modalL1) : [];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Admin Control Center</h1>

      {/* 1. REGISTRATION RECEIPTS AUDIT & APPROVAL QUEUE */}
      <div className="bg-white dark:bg-[#121620]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 w-full shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              🧾 ₦5,000 Registration Receipts Audit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review GTB transfer receipts, approve user access, or flag fraudulent submissions.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
            Total Proofs: {registrationProofs.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 w-full max-h-96 overflow-y-auto">
          {registrationProofs.length > 0 ? (
            registrationProofs.map((req) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{req.full_name}</p>
                    {req.status === 'approved' ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                        Live / Active
                      </span>
                    ) : req.status === 'rejected' ? (
                      <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-semibold">
                        Flagged Fake
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                        Pending Admin Review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{req.email} • {req.phone_number || 'No phone'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Sponsor: <strong className="text-amber-600 dark:text-amber-400">{req.referred_by || 'None (Direct)'}</strong> • Date: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {req.proof_url && req.proof_url !== 'FREE_PROMO_REGISTRATION' ? (
                    <button
                      onClick={() => setPreviewReceiptUrl(req.proof_url)}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
                    >
                      🔍 View Receipt
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic pr-2">No receipt (Free promo)</span>
                  )}

                  {req.status !== 'approved' ? (
                    <button
                      onClick={() => handleApproveUser(req.email, req.id)}
                      disabled={approvingEmail === req.email}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
                    >
                      {approvingEmail === req.email ? 'Activating...' : '✓ Approve & Activate'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                      ✓ Approved & Active
                    </span>
                  )}

                  {req.status !== 'rejected' && (
                    <button
                      onClick={() => handleFlagFakeReceipt(req.id, req.email)}
                      className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-600/30 font-bold rounded-xl text-xs transition"
                    >
                      🚩 Flag Fake
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-xs py-4 text-center">No registration receipts submitted yet.</p>
          )}
        </div>
      </div>

      {/* RECEIPT INSPECTION LIGHTBOX MODAL */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Proof Inspection</h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0E14] p-2 flex items-center justify-center">
              <img
                src={previewReceiptUrl}
                alt="Payment Receipt"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#FF6B4A] hover:underline font-semibold"
              >
                Open full resolution &rarr;
              </a>

              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PENDING SALES LOGGED BY AGENTS */}
      <div className="bg-white dark:bg-[#121620]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 w-full shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-amber-500 dark:text-amber-400">Pending Sales Logged by Agents</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 w-full">
          {pendingSales.length > 0 ? (
            pendingSales.map((sale) => {
              const saleAmount = Number(sale.amount) || 0;
              const directCommission = saleAmount * 0.15;
              const uplineCommission = saleAmount * 0.03;

              return (
                <div key={sale.id} className="py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                  <div className="min-w-0 w-full space-y-1">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white break-all">
                      {sale.profiles?.full_name} <span className="text-slate-500 dark:text-slate-400 font-normal">({sale.profiles?.email})</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">{sale.description}</p>
                    
                    {/* Bank Preview */}
                    <div className="bg-slate-50 dark:bg-[#0B0E14] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 my-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Seller Bank Details</span>
                      <p>Bank: <strong className="text-slate-900 dark:text-white">{sale.profiles?.bank_name || 'Not Set'}</strong> • Account: <strong className="text-slate-900 dark:text-white">{sale.profiles?.account_number || 'Not Set'}</strong> ({sale.profiles?.account_name || 'Not Set'})</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Sale: ₦{saleAmount.toLocaleString()}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        15% Direct: ₦{directCommission.toLocaleString()}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        3% Upline: ₦{uplineCommission.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0">
                    <button
                      onClick={() => handleApproveSale(sale.id)}
                      disabled={loadingId === sale.id || deletingSaleId === sale.id}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
                    >
                      {loadingId === sale.id ? 'Approving...' : 'Approve & Settle Sale'}
                    </button>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      disabled={loadingId === sale.id || deletingSaleId === sale.id}
                      className="px-4 py-2.5 bg-rose-600/10 dark:bg-rose-600/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-600/30 dark:border-rose-600/40 font-bold rounded-xl text-xs transition disabled:opacity-50"
                    >
                      {deletingSaleId === sale.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-sm py-4">No pending sales awaiting approval.</p>
          )}
        </div>
      </div>

      {/* 3. USER DIRECTORY */}
      <div className="bg-white dark:bg-[#121620]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 w-full shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">User Directory</h2>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              Total: {filteredUsers.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white w-full sm:w-64 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition"
          />
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 w-full">
          {filteredUsers.map((u, index) => (
            <div key={u.id} className="py-4 flex flex-col gap-3 w-full min-w-0">
              <div className="flex items-start gap-3 min-w-0 w-full">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                  #{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white break-words">
                      {u.full_name || 'N/A'} <span className="text-xs text-[#FF6B4A] font-medium">({u.role})</span>
                    </p>
                    {u.is_approved ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">Approved</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{u.email}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 dark:bg-[#0B0E14] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Referral Code</span>
                <code className="text-xs font-mono text-[#FF6B4A] break-all block font-bold">
                  {u.referral_code}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="w-full text-xs py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition text-center"
                >
                  Manage User
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id, u.full_name)}
                  disabled={deletingUserId === u.id}
                  className="w-full text-xs py-2 bg-rose-600/10 dark:bg-rose-600/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white font-semibold rounded-xl border border-rose-600/30 dark:border-rose-600/40 transition disabled:opacity-50 text-center"
                >
                  {deletingUserId === u.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANAGE USER MODAL WITH NETWORK TREE */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold">Agent Details & Downline Tree</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs border-b border-slate-200 dark:border-slate-800 pb-4 break-words">
              <p><strong className="text-slate-500 dark:text-slate-400">Full Name:</strong> {selectedUser.full_name}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Email:</strong> <span className="break-all">{selectedUser.email}</span></p>
              <p><strong className="text-slate-500 dark:text-slate-400">Status:</strong> {selectedUser.is_approved ? 'Approved' : 'Pending Activation'}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Phone:</strong> {selectedUser.phone_number || 'Not provided'}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Bank Name:</strong> {selectedUser.bank_name || 'Not provided'}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Account Name:</strong> {selectedUser.account_name || 'Not provided'}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Account Number:</strong> {selectedUser.account_number || 'Not provided'}</p>
              <p><strong className="text-slate-500 dark:text-slate-400">Referral Code:</strong> <span className="font-mono text-amber-600 dark:text-amber-400 break-all font-bold">{selectedUser.referral_code}</span></p>
              <p><strong className="text-slate-500 dark:text-slate-400">Sponsor:</strong> <span className="text-amber-600 dark:text-amber-400 font-semibold break-words">{getSponsorInfo(selectedUser.referred_by)}</span></p>
            </div>

            {/* Downline Tree */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Network Tree</h4>
              
              <div className="bg-slate-50 dark:bg-[#0B0E14] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto min-h-[250px] flex items-center justify-center">
                <div className="min-w-[480px] flex flex-col items-center py-2">
                  <div className="flex flex-col items-center relative">
                    <div className="bg-white dark:bg-[#121620] border-2 border-[#FF6B4A] px-5 py-2 rounded-2xl text-center shadow-lg z-10 w-48">
                      <span className="text-[8px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">ROOT</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedUser.full_name || 'Agent'}</p>
                    </div>
                    {modalL1.length > 0 && <div className="w-0.5 h-6 bg-gradient-to-b from-[#FF6B4A] to-slate-400 dark:to-slate-700"></div>}
                  </div>

                  {modalL1.length > 0 ? (
                    <div className="w-full flex flex-col items-center">
                      {modalL1.length > 1 && <div className="w-3/4 h-0.5 bg-slate-300 dark:bg-slate-700"></div>}
                      <div className={`w-full grid ${modalL1.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-6 pt-3`}>
                        {modalL1.map((l1) => {
                          const subDownlines = modalL2.filter((l2) => {
                            const ref = l2.referred_by?.trim().toLowerCase();
                            return ref === l1.id?.trim().toLowerCase() || ref === l1.referral_code?.trim().toLowerCase();
                          });

                          return (
                            <div key={l1.id} className="flex flex-col items-center">
                              <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl text-center shadow-md w-48 space-y-1">
                                <span className="text-[8px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Level 1</span>
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{l1.full_name || 'Agent'}</p>
                              </div>

                              {subDownlines.length > 0 && <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700"></div>}

                              {subDownlines.length > 0 && (
                                <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                                  {subDownlines.map((l2) => (
                                    <div key={l2.id} className="bg-white dark:bg-[#121620]/90 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-xl text-center">
                                      <span className="text-[7px] uppercase font-bold text-slate-400 block">L2</span>
                                      <p className="text-[10px] font-semibold truncate">{l2.full_name || 'Sub-Agent'}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-4">No team members recruited yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name)}
                disabled={deletingUserId === selectedUser.id}
                className="w-full sm:w-1/2 bg-rose-600/10 dark:bg-rose-600/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-600/30 dark:border-rose-600/40 font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
              >
                {deletingUserId === selectedUser.id ? 'Deleting...' : 'Delete User'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}