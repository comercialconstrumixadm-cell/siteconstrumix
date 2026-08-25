import { NextRequest, NextResponse } from 'next/server';
import { buscarClientesZeus } from '@/lib/postgres/clientesConstrumix';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (termo.length < 2) {
    return NextResponse.json({ clientes: [] });
  }

  try {
    const clientes = await buscarClientesZeus(termo);
    return NextResponse.json({ clientes });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
