import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AliExpressSDK } from '@/lib/aliexpress';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * OAuth Callback from AliExpress
 * After the user authorizes, AliExpress redirects here with ?code=xxx
 * We exchange the code for access_token + refresh_token
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/admin/dropship/settings?error=no_code', req.url));
  }

  try {
    // Get config
    const { data: config } = await supabaseAdmin
      .from('dropship_config')
      .select('*')
      .eq('provider', 'aliexpress')
      .single();

    if (!config?.app_key || !config?.app_secret) {
      return NextResponse.redirect(new URL('/admin/dropship/settings?error=no_config', req.url));
    }

    const sdk = new AliExpressSDK({
      appKey: config.app_key,
      appSecret: config.app_secret,
    });

    // Exchange code for tokens
    const tokens = await sdk.getAccessToken(code);

    // Save tokens
    await supabaseAdmin.from('dropship_config').update({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_expires_at: new Date(Date.now() + tokens.expiresIn).toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }).eq('id', config.id);

    // Log
    await supabaseAdmin.from('dropship_sync_log').insert({
      action: 'token_refresh',
      provider: 'aliexpress',
      status: 'success',
      details: { event: 'oauth_callback', expires_in: tokens.expiresIn },
    });

    return NextResponse.redirect(new URL('/admin/dropship/settings?success=connected', req.url));
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL(`/admin/dropship/settings?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
