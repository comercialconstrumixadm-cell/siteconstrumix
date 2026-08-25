import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { calcularLogisticaSerie } from '@/lib/logistica';
import { listEntregasMensal, listLogisticaMensal } from '@/lib/db/logisticaMensal';
import { salvarLogisticaCalculada } from '@/lib/db/logisticaHistory';
import { getMetasLogisticaOverrideMap } from '@/lib/db/metasLogisticaOverride';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const entregas = listEntregasMensal();
  const config = listLogisticaMensal();
  const overrides = getMetasLogisticaOverrideMap();
  // Mesmo alinhamento de trimestre da bonificação de vendas (Dez-Jan-Fev, ...).
  const resultado = calcularLogisticaSerie(entregas, config, 12, overrides);
  salvarLogisticaCalculada(resultado);

  return NextResponse.json({ resultado });
}
