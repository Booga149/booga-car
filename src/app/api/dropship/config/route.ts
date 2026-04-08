import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// GET — fetch config
export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('dropship_config')
    .select('id, provider, app_key, is_active, auto_fulfill, auto_sync_prices, auto_sync_stock, default_markup_percent, sync_interval_hours, token_expires_at, updated_at')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configs: data || [] });
}

// POST — save/update config
export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();
  const { provider, app_key, app_secret, default_markup_percent, auto_fulfill, auto_sync_prices, auto_sync_stock } = body;

  if (!provider) return NextResponse.json({ error: 'Provider required' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('dropship_config')
    .select('id')
    .eq('provider', provider)
    .single();

  const updates: any = {
    provider,
    updated_at: new Date().toISOString(),
  };
  if (app_key !== undefined) updates.app_key = app_key;
  if (app_secret !== undefined) updates.app_secret = app_secret;
  if (default_markup_percent !== undefined) updates.default_markup_percent = default_markup_percent;
  if (auto_fulfill !== undefined) updates.auto_fulfill = auto_fulfill;
  if (auto_sync_prices !== undefined) updates.auto_sync_prices = auto_sync_prices;
  if (auto_sync_stock !== undefined) updates.auto_sync_stock = auto_sync_stock;

  if (existing) {
    const { error } = await supabaseAdmin
      .from('dropship_config')
      .update(updates)
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin
      .from('dropship_config')
      .insert(updates);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
