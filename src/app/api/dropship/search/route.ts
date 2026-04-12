import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createAliExpressSDK } from '@/lib/aliexpress';
import { translateSearchQuery } from '@/lib/carPartsTranslator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const sort = searchParams.get('sort') as any;

  if (!rawQuery) return NextResponse.json({ error: 'Search query required' }, { status: 400 });

  // Auto-translate Arabic queries to English for AliExpress
  const translatedQuery = translateSearchQuery(rawQuery);

  console.log(`AliExpress search: "${rawQuery}" → "${translatedQuery}"`);

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) {
      return NextResponse.json({ error: 'AliExpress not configured. Go to Settings to connect your account.' }, { status: 400 });
    }

    // Try search with retry on timeout
    let result;
    try {
      result = await sdk.searchProducts({
        query: translatedQuery,
        page,
        pageSize: 20,
        minPrice,
        maxPrice,
        sort,
        shipToCountry: 'SA',
      });
    } catch (firstErr: any) {
      // If RPC timeout, retry once with simpler query
      if (firstErr.message?.includes('timeout') || firstErr.message?.includes('RPC')) {
        console.log('AliExpress timeout, retrying with simpler query...');
        const simpleQuery = translatedQuery.split(' ').slice(0, 2).join(' ');
        result = await sdk.searchProducts({
          query: simpleQuery,
          page,
          pageSize: 20,
          shipToCountry: 'SA',
        });
      } else {
        throw firstErr;
      }
    }

    console.log('AliExpress search result:', JSON.stringify({
      rawQuery,
      translatedQuery,
      productCount: result.products?.length || 0,
      totalCount: result.totalCount,
    }));

    return NextResponse.json({
      ...result,
      _translatedQuery: translatedQuery,
      _originalQuery: rawQuery,
    });
  } catch (error: any) {
    console.error('AliExpress search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
