import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieStore = cookies();
        return (cookieStore as any).getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    // OAuth code exchange (Google sign-in)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback error (code exchange):', error.message);
      return NextResponse.redirect(new URL('/?auth_error=exchange_failed', requestUrl.origin));
    }
    return response;
  }

  if (token_hash && type) {
    // Email confirmation / magic link / password recovery
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Auth callback error (token verification):', error.message);
      return NextResponse.redirect(new URL('/?auth_error=verify_failed', requestUrl.origin));
    }
    return response;
  }

  // Fallback: redirect to homepage
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
