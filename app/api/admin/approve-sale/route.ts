import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side client using Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { saleId } = await req.json();

    if (!saleId) {
      return NextResponse.json({ success: false, error: 'Sale ID is required.' }, { status: 400 });
    }

    // 1. Fetch Sale Details
    const { data: sale, error: saleErr } = await supabaseAdmin
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single();

    if (saleErr || !sale || sale.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'Sale invalid, not found, or already approved.' },
        { status: 400 }
      );
    }

    const amount = Number(sale.amount);
    const sellerId = sale.seller_id;

    // 2. Update Sale Status to 'approved'
    const { error: updateErr } = await supabaseAdmin
      .from('sales')
      .update({ status: 'approved' })
      .eq('id', saleId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 3. Fetch Seller's Profile to check for referral tree sponsors
    const { data: seller } = await supabaseAdmin
      .from('profiles')
      .select('id, referred_by')
      .eq('id', sellerId)
      .single();

    // 4. Calculate Level 1 Commission (15% to direct sponsor)
    if (seller?.referred_by) {
      const level1Amount = amount * 0.15;

      await supabaseAdmin.from('commissions').insert({
        user_id: seller.referred_by,
        sale_id: saleId,
        amount: level1Amount,
        level: 1,
      });

      // 5. Fetch Level 1 Sponsor to find Level 2 Sponsor
      const { data: level1Sponsor } = await supabaseAdmin
        .from('profiles')
        .select('referred_by')
        .eq('id', seller.referred_by)
        .single();

      // Calculate Level 2 Commission (3% to indirect sponsor)
      if (level1Sponsor?.referred_by) {
        const level2Amount = amount * 0.03;

        await supabaseAdmin.from('commissions').insert({
          user_id: level1Sponsor.referred_by,
          sale_id: saleId,
          amount: level2Amount,
          level: 2,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Sale approved and commissions credited.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}