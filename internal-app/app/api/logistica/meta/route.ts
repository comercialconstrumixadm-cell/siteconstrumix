import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getMetaVigenteEntregas } from '@/lib/logistica';
import { listEntregasMensal } from '@/lib/db/logisticaMensal';
import { getMetasLogisticaOverrideMap, setMetaLogisticaOverride } from '@/lib/db/metasLogisticaOverride';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const entregas = listEntregasMensal();
  const overrides = getMetasLogisticaOverrideMap();
  const info = getMetaVigenteEntregas(entregas, new Date(), 12, overrides);

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

  setMetaLogisticaOverride(blockYear, blockMonth, meta);

  const entregas = listEntregasMensal();
  const overrides = getMetasLogisticaOverrideMap();
  const info = getMetaVigenteEntregas(entregas, new Date(), 12, overrides);

  return NextResponse.json(info);
}
