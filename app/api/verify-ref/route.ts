import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { refCode } = await req.json();
    const cleanCode = refCode ? refCode.trim() : '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Query Supabase REST API directly
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?referral_code=eq.${encodeURIComponent(cleanCode)}&select=id,referral_code`,
      {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ valid: false, message: `DB Error: ${errText}` }, { status: 400 });
    }

    const profiles = await res.json();

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ valid: false, message: `Referral code '${cleanCode}' not found.` }, { status: 400 });
    }

    return NextResponse.json({ valid: true, sponsorId: profiles[0].id });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err.message }, { status: 500 });
  }
}