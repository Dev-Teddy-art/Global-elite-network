import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Requires Service Role Key in .env.local
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Delete associated sales logged by this user (prevents FK constraint errors)
    await supabaseAdmin.from('sales').delete().eq('seller_id', userId);

    // 2. Delete associated commissions earned by this user
    await supabaseAdmin.from('commissions').delete().eq('user_id', userId);

    // 3. Delete from the public profiles table
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) throw profileErr;

    // 4. Delete from Supabase Auth schema (removes login access)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.warn('Profile deleted, but auth account removal failed:', authErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}