import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getMetaVigente } from '@/lib/bonus';
import { listAbatimentoMensal } from '@/lib/db/abatimento';
import { getMetasOverrideMap, setMetaOverride } from '@/lib/db/metasTrimestrais';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const abatimentos = listAbatimentoMensal();
  const overrides = getMetasOverrideMap();
  // Mesmo alinhamento de trimestre usado no cálculo do bônus (Dez-Jan-Fev, ...).
  const info = getMetaVigente(abatimentos, new Date(), 12, overrides);

  return NextResponse.json(info);
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json();
  const blockYear = Number(body.blockYear);
  const blockMonth = Number(body.blockMonth);
  const meta = Number(body.meta);

  if (!Number.isFinite(blockYear) || !Number.isFinite(blockMonth) || !Number.isFinite(meta) || meta < 0) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  setMetaOverride(blockYear, blockMonth, meta);

  const abatimentos = listAbatimentoMensal();
  const overrides = getMetasOverrideMap();
  const info = getMetaVigente(abatimentos, new Date(), 12, overrides);

  return NextResponse.json(info);
}
