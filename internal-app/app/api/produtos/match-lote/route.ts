import { NextRequest, NextResponse } from 'next/server';
import { casarListaComCatalogo } from '@/lib/orcamento/parseLista';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const texto = typeof body?.texto === 'string' ? body.texto : '';

  return NextResponse.json({ itens: casarListaComCatalogo(texto) });
}
