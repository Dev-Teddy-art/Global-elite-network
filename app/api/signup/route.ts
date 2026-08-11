import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, sponsorId } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Create Auth User via Supabase Admin REST API
    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
      }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      // Fallback if admin endpoint fails: try standard signup endpoint
      const stdAuthRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const stdData = await stdAuthRes.json();
      if (!stdAuthRes.ok) {
        return NextResponse.json({ error: stdData.msg || stdData.error_description || 'Auth registration failed.' }, { status: 400 });
      }
      authData.id = stdData.id || stdData.user?.id;
    }

    const userId = authData.id || authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Failed to retrieve created user ID.' }, { status: 400 });
    }

    // 2. Generate New User's Referral Code
    const nameSlug = fullName ? fullName.toLowerCase().replace(/\s+/g, '') : 'agent';
    const newCode = nameSlug + Math.floor(1000 + Math.random() * 9000);

    // 3. Insert Profile Row
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: userId,
        email,
        full_name: fullName || 'New Agent',
        referral_code: newCode,
        referred_by: sponsorId,
        role: 'user',
      }),
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      return NextResponse.json({ error: `Profile Creation Failed: ${errText}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}