import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { calcularBonusSerie } from '@/lib/bonus';
import { listAbatimentoMensal } from '@/lib/db/abatimento';
import { listVendedoresAtivos } from '@/lib/db/vendedores';
import { salvarBonusCalculado } from '@/lib/db/bonusHistory';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const abatimentos = listAbatimentoMensal();
  const vendedores = listVendedoresAtivos();
  const resultado = calcularBonusSerie(abatimentos, vendedores);
  salvarBonusCalculado(resultado);

  return NextResponse.json({ resultado });
}
