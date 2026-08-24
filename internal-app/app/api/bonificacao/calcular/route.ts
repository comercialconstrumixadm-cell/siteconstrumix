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
  // Trimestres reais da empresa começam em dezembro (Dez/Jan/Fev, Mar/Abr/Mai, ...),
  // não em janeiro (confirmado com o Marcos em 2026-08 contra a planilha real).
  const resultado = calcularBonusSerie(abatimentos, vendedores, 12);
  salvarBonusCalculado(resultado);

  return NextResponse.json({ resultado });
}
