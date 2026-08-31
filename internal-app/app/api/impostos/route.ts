import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getLucroPresumidoSams, getSimplesNacionalMensal } from '@/lib/postgres/impostosPorEmpresa';

export const runtime = 'nodejs';

/** Janeiro até dezembro do ano informado — ou até o mês atual, se for o ano corrente (evita meses futuros sem dado). */
function mesesDoAno(year: number): { year: number; month: number }[] {
  const hoje = new Date();
  const ultimoMes = year === hoje.getUTCFullYear() ? hoje.getUTCMonth() + 1 : 12;
  const meses: { year: number; month: number }[] = [];
  for (let month = 1; month <= ultimoMes; month++) {
    meses.push({ year, month });
  }
  return meses;
}

export async function GET(request: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const anoParam = request.nextUrl.searchParams.get('year');
  const year = anoParam ? Number(anoParam) : new Date().getUTCFullYear();
  const meses = mesesDoAno(year);

  const [construmix, newhouse, sams] = await Promise.all([
    getSimplesNacionalMensal('construmix', meses),
    getSimplesNacionalMensal('newhouse', meses),
    getLucroPresumidoSams(meses),
  ]);

  return NextResponse.json({ construmix, newhouse, sams });
}
