import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { listVendedoresNomes } from '@/lib/db/vendedoresNomes';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ nomes: listVendedoresNomes() });
}
