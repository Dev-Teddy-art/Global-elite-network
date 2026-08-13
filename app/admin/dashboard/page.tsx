'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    verifyAndLoadAdminData();
  }, []);

  const verifyAndLoadAdminData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'info@globalsaleselite.com') {
      router.push('/dashboard');
      return;
    }

    const { data: sales } = await supabase
      .from('sales')
      .select('id, amount, description, created_at, profiles(full_name, email)')
      .eq('status', 'pending');

    setPendingSales(sales || []);

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
      
    setUsers(allUsers || []);
  };

  const handleApprove = async (saleId: string) => {
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
    if (!confirm('Are you sure you want to delete this pending sale? This action cannot be undone.')) {
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
        alert('Pending sale removed successfully.');
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
    if (!confirm(`Are you sure you want to delete user "${userName || 'N/A'}"? This action removes their profile and account permanently.`)) {
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
        alert('User deleted successfully.');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        alert(`Failed to delete user: ${data.error}`);
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

    if (sponsor) {
      return `${sponsor.full_name || 'User'} (${sponsor.referral_code})`;
    }

    return referredBy;
  };

  const getLevel1ForUser = (userObj: any) => {
    if (!userObj) return [];
    return users.filter((u) => {
      if (!u.referred_by) return false;
      const ref = u.referred_by.trim().toLowerCase();
      const userCode = userObj.referral_code?.trim().toLowerCase();
      const userId = userObj.id?.trim().toLowerCase();

      return ref === userCode || ref === userId;
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

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Control Center</h1>

      {/* Pending Sales */}
      <div className="bg-[#121620]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 w-full">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">Pending Sales Logged by Agents</h2>
        <div className="divide-y divide-slate-800 w-full">
          {pendingSales.length > 0 ? (
            pendingSales.map((sale) => (
              <div key={sale.id} className="py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                <div className="min-w-0 w-full space-y-1">
                  <p className="font-semibold text-sm sm:text-base text-white break-all">
                    {sale.profiles?.full_name} <span className="text-slate-400 font-normal">({sale.profiles?.email})</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed break-words">{sale.description}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">₦{Number(sale.amount).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0">
                  <button
                    onClick={() => handleApprove(sale.id)}
                    disabled={loadingId === sale.id || deletingSaleId === sale.id}
                    className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {loadingId === sale.id ? 'Approving...' : 'Approve & Pay Commission'}
                  </button>
                  <button
                    onClick={() => handleDeleteSale(sale.id)}
                    disabled={loadingId === sale.id || deletingSaleId === sale.id}
                    className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-600/40 font-bold rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {deletingSaleId === sale.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm py-4">No pending sales awaiting approval.</p>
          )}
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-[#121620]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">User Directory</h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              Total: {filteredUsers.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-xs text-white w-full sm:w-64 focus:outline-none focus:border-slate-700 transition"
          />
        </div>

        <div className="divide-y divide-slate-800 w-full">
          {filteredUsers.map((u, index) => (
            <div key={u.id} className="py-4 flex flex-col gap-3 w-full min-w-0">
              {/* Top Row: Number + User Name & Email */}
              <div className="flex items-start gap-3 min-w-0 w-full">
                <span className="w-7 h-7 rounded-lg bg-[#0B0E14] border border-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                  #{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-white break-words">
                    {u.full_name || 'N/A'}{' '}
                    <span className="text-xs text-[#E05244] font-medium">({u.role})</span>
                  </p>
                  <p className="text-xs text-slate-400 break-all">{u.email}</p>
                </div>
              </div>

              {/* Middle Row: Full-width Referral Code Box */}
              <div className="w-full bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800 min-w-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Referral Code</span>
                <code className="text-xs font-mono text-[#E05244] break-all block font-bold">
                  {u.referral_code}
                </code>
              </div>

              {/* Bottom Row: Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition text-center"
                >
                  Manage User
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id, u.full_name)}
                  disabled={deletingUserId === u.id}
                  className="w-full text-xs py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold rounded-xl border border-rose-600/40 transition disabled:opacity-50 text-center"
                >
                  {deletingUserId === u.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANAGE USER MODAL */}
      {selectedUser && (() => {
        const modalL1 = getLevel1ForUser(selectedUser);
        const modalL2 = getLevel2ForUser(modalL1);

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-[#121620] border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-6 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-bold">Agent Details & Downline Tree</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
              </div>

              <div className="space-y-3 text-xs border-b border-slate-800 pb-4 break-words">
                <p><strong className="text-slate-400">Full Name:</strong> {selectedUser.full_name}</p>
                <p><strong className="text-slate-400">Email:</strong> <span className="break-all">{selectedUser.email}</span></p>
                <p><strong className="text-slate-400">Phone:</strong> {selectedUser.phone_number || 'Not provided'}</p>
                <p><strong className="text-slate-400">Date of Birth:</strong> {selectedUser.date_of_birth || 'Not provided'}</p>
                <p><strong className="text-slate-400">Bank Name:</strong> {selectedUser.bank_name || 'Not provided'}</p>
                <p><strong className="text-slate-400">Account Name:</strong> {selectedUser.account_name || 'Not provided'}</p>
                <p><strong className="text-slate-400">Account Number:</strong> {selectedUser.account_number || 'Not provided'}</p>
                <p><strong className="text-slate-400">Referral Code:</strong> <span className="font-mono text-amber-400 break-all">{selectedUser.referral_code}</span></p>
                <p><strong className="text-slate-400">Sponsor (Referred By):</strong> <span className="text-amber-400 font-semibold break-words">{getSponsorInfo(selectedUser.referred_by)}</span></p>
              </div>

              {/* Binary Downline Tree Visualizer */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-400">Network Tree</h4>
                
                <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800/80 overflow-x-auto min-h-[300px] flex items-center justify-center">
                  <div className="min-w-[500px] flex flex-col items-center py-2">
                    
                    {/* LEVEL 0: ROOT AGENT */}
                    <div className="flex flex-col items-center relative">
                      <div className="bg-[#121620] border-2 border-[#E05244] px-5 py-2 rounded-2xl text-center shadow-xl z-10 w-52">
                        <span className="text-[8px] uppercase font-bold text-amber-400 tracking-wider block">ROOT LEG</span>
                        <p className="text-xs font-bold text-white truncate">{selectedUser.full_name || 'Agent'}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{selectedUser.email}</p>
                      </div>
                      
                      {/* Vertical Connector Down */}
                      {modalL1.length > 0 && (
                        <div className="w-0.5 h-6 bg-gradient-to-b from-[#E05244] to-slate-700"></div>
                      )}
                    </div>

                    {/* LEVEL 1: DIRECT REFERRALS */}
                    {modalL1.length > 0 ? (
                      <div className="w-full flex flex-col items-center">
                        
                        {/* Horizontal Line Linking L1 Nodes */}
                        {modalL1.length > 1 && (
                          <div className="relative w-3/4 flex justify-between items-center">
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-700"></div>
                          </div>
                        )}

                        <div className={`w-full grid ${modalL1.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-6 pt-3`}>
                          {modalL1.map((l1) => {
                            const subDownlines = modalL2.filter((l2) => {
                              const ref = l2.referred_by?.trim().toLowerCase();
                              return ref === l1.id?.trim().toLowerCase() || ref === l1.referral_code?.trim().toLowerCase();
                            });

                            return (
                              <div key={l1.id} className="flex flex-col items-center">
                                
                                {/* L1 Card */}
                                <div className="bg-[#121620] border border-slate-700 px-3 py-2.5 rounded-2xl text-center shadow-lg w-52 space-y-1 relative z-10">
                                  <span className="text-[8px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                    Level 1
                                  </span>
                                  <p className="text-xs font-bold text-white truncate mt-0.5">{l1.full_name || 'Agent'}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{l1.email}</p>
                                  <code className="text-[9px] font-mono text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                                    {l1.referral_code}
                                  </code>
                                </div>

                                {/* Connector down to L2 */}
                                {subDownlines.length > 0 && (
                                  <div className="w-0.5 h-5 bg-slate-700"></div>
                                )}

                                {/* LEVEL 2: SUB-REFERRALS */}
                                {subDownlines.length > 0 && (
                                  <div className="w-full flex flex-col items-center">
                                    {subDownlines.length > 1 && (
                                      <div className="w-1/2 h-0.5 bg-slate-800 my-1"></div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full pt-1">
                                      {subDownlines.map((l2) => (
                                        <div key={l2.id} className="bg-[#121620]/90 border border-slate-800/80 p-1.5 rounded-xl text-center shadow-sm">
                                          <span className="text-[7px] uppercase font-bold text-slate-500 block">L2 Leg</span>
                                          <p className="text-[10px] font-semibold text-slate-200 truncate">{l2.full_name || 'Sub-Agent'}</p>
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
                      <p className="text-xs text-slate-500 py-4">This agent has not referred any team members yet.</p>
                    )}

                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name)}
                  disabled={deletingUserId === selectedUser.id}
                  className="w-full sm:w-1/2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-600/40 font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
                >
                  {deletingUserId === selectedUser.id ? 'Deleting...' : 'Delete User'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full sm:w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}