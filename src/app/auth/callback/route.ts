import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (code) {
    // OAuth code exchange (Google sign-in)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    console.error('Auth callback error (code exchange):', error.message);
  }

  if (token_hash && type) {
    // Email confirmation / magic link / password recovery
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    console.error('Auth callback error (token verification):', error.message);
  }

  // Fallback: redirect to homepage
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
