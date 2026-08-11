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
      .select('*');
      
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

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>

      {/* Pending Sales */}
      <div className="bg-[#121620]/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Pending Sales Logged by Agents</h2>
        <div className="divide-y divide-slate-800">
          {pendingSales.length > 0 ? (
            pendingSales.map((sale) => (
              <div key={sale.id} className="py-4 flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-white">{sale.profiles?.full_name} ({sale.profiles?.email})</p>
                  <p className="text-xs text-slate-400">{sale.description}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">₦{Number(sale.amount).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleApprove(sale.id)}
                  disabled={loadingId === sale.id}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  {loadingId === sale.id ? 'Approving...' : 'Approve & Pay Commission'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm py-4">No pending sales awaiting approval.</p>
          )}
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-[#121620]/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">User Directory & Network</h2>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 bg-[#0B0E14] border border-slate-800 rounded-xl text-xs text-white w-64"
          />
        </div>

        <div className="divide-y divide-slate-800">
          {filteredUsers.map((u) => (
            <div key={u.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-white">{u.full_name || 'N/A'} <span className="text-xs text-[#E05244]">({u.role})</span></p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-[#E05244] bg-[#0B0E14] px-3 py-1 rounded-lg border border-slate-800">
                  Ref Code: {u.referral_code}
                </code>
                <button
                  onClick={() => setSelectedUser(u)}
                  className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700"
                >
                  Manage User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANAGE USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121620] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Agent Profile Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p><strong className="text-slate-400">Full Name:</strong> {selectedUser.full_name}</p>
              <p><strong className="text-slate-400">Email:</strong> {selectedUser.email}</p>
              <p><strong className="text-slate-400">Phone:</strong> {selectedUser.phone_number || 'Not provided'}</p>
              <p><strong className="text-slate-400">Date of Birth:</strong> {selectedUser.date_of_birth || 'Not provided'}</p>
              <p><strong className="text-slate-400">Bank Name:</strong> {selectedUser.bank_name || 'Not provided'}</p>
              <p><strong className="text-slate-400">Account Number:</strong> {selectedUser.account_number || 'Not provided'}</p>
              <p><strong className="text-slate-400">Referral Code:</strong> {selectedUser.referral_code}</p>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full bg-[#E05244] hover:bg-[#c94336] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}