import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, requestId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Activate profile access
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_approved: true })
      .eq('email', email);

    if (profileError) throw profileError;

    // 2. Mark registration request as approved
    if (requestId) {
      await supabaseAdmin
        .from('registration_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Approval failed' }, { status: 500 });
  }
}