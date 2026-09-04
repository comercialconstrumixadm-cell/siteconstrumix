import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  analisarTendencia,
  comparativoAnual,
  getEvolucaoMensalConstrumix,
  rankingMeses,
} from '@/lib/postgres/construmixEvolucao';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const serie = await getEvolucaoMensalConstrumix(24);
    return NextResponse.json({
      serie,
      anos: comparativoAnual(serie),
      tendencia: analisarTendencia(serie),
      ranking: rankingMeses(serie),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
