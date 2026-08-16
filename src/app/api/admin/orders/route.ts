import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Auth for everything under /api/admin/* is already enforced by middleware.ts
// before this handler ever runs - no separate check needed here.
export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as {
    id: string;
    shipment_status?: 'pending' | 'shipped' | 'delivered';
    tracking_number?: string;
    tracking_carrier?: string;
  };
  if (!body.id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.shipment_status) update.shipment_status = body.shipment_status;
  if (body.tracking_number !== undefined) update.tracking_number = body.tracking_number;
  if (body.tracking_carrier !== undefined) update.tracking_carrier = body.tracking_carrier;

  const db = supabaseAdmin();
  const { error } = await db.from('orders').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
