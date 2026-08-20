import { NextRequest, NextResponse } from 'next/server';
import { buscarProdutos } from '@/lib/db/catalog';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!termo) {
    return NextResponse.json({ produtos: [] });
  }

  try {
    const produtos = buscarProdutos(termo, 20);
    return NextResponse.json({ produtos });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
