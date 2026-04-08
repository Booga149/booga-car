import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAliExpressSDK } from '@/lib/aliexpress';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const sort = searchParams.get('sort') as any;

  if (!query) return NextResponse.json({ error: 'Search query required' }, { status: 400 });

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) {
      return NextResponse.json({ error: 'AliExpress not configured. Go to Settings to connect your account.' }, { status: 400 });
    }

    const result = await sdk.searchProducts({
      query,
      page,
      pageSize: 20,
      minPrice,
      maxPrice,
      sort,
      shipToCountry: 'SA',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AliExpress search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
