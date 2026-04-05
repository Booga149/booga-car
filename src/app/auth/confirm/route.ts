import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') || 'signup';
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (!token_hash) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  });

  if (!error) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  console.error('Auth confirm error:', error.message);
  return NextResponse.redirect(new URL('/?error=confirmation_failed', requestUrl.origin));
}
