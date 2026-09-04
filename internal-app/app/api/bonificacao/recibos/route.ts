import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { gerarPdfRecibos, type Recibo } from '@/lib/reciboPdf';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const recibos = body?.recibos as Recibo[] | undefined;

  if (!recibos || recibos.length === 0) {
    return NextResponse.json({ error: 'Nenhum recibo para gerar.' }, { status: 400 });
  }

  try {
    const pdfBytes = await gerarPdfRecibos(recibos);
    return NextResponse.json({ pdfBase64: Buffer.from(pdfBytes).toString('base64') });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
