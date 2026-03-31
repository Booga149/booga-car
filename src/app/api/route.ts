import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Booga Car API' }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ received: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
