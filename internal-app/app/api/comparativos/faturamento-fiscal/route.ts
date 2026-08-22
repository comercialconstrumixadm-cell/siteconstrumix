import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getFaturamentoFiscalComparativo } from '@/lib/postgres/faturamentoFiscalPorEmpresa';

export const runtime = 'nodejs';

function ultimosMeses(quantidade: number): { year: number; month: number }[] {
  const meses: { year: number; month: number }[] = [];
  const hoje = new Date();
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - i, 1));
    meses.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  return meses;
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const resultado = await getFaturamentoFiscalComparativo(['construmix', 'sams', 'newhouse'], ultimosMeses(6));
  return NextResponse.json({ resultado });
}
