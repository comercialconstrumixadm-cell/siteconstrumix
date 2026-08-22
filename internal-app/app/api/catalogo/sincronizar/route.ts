import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { sincronizarCatalogo } from '@/lib/postgres/catalogSync';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const resultado = await sincronizarCatalogo();
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
