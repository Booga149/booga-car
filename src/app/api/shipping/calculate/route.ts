import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping, searchCities, getAllCities } from '@/lib/saudiShipping';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'calculate';

  // Search cities
  if (action === 'search') {
    const query = searchParams.get('q') || '';
    const results = searchCities(query);
    return NextResponse.json({ cities: results });
  }

  // List all cities
  if (action === 'cities') {
    const cities = getAllCities();
    return NextResponse.json({ cities });
  }

  // Calculate shipping
  const cityKey = searchParams.get('city') || '';
  const weightKg = parseFloat(searchParams.get('weight') || '1');
  const orderTotal = parseFloat(searchParams.get('total') || '0');

  if (!cityKey) {
    return NextResponse.json({ error: 'يرجى اختيار المدينة' }, { status: 400 });
  }

  const quote = calculateShipping({ cityKey, weightKg, orderTotal });
  if (!quote) {
    return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
  }

  return NextResponse.json(quote);
}
