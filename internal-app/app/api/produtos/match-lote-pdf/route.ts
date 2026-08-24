import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { casarListaComCatalogo } from '@/lib/orcamento/parseLista';

export const runtime = 'nodejs';

const MAX_TAMANHO_BYTES = 10 * 1024 * 1024; // 10MB

/** Marcador de página que a lib de extração insere entre páginas (ex: "-- 1 of 3 --") — não é item da lista. */
const RE_MARCADOR_PAGINA = /^--\s*\d+\s*of\s*\d+\s*--$/i;

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const arquivo = formData?.get('arquivo');

  if (!arquivo || !(arquivo instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo PDF enviado.' }, { status: 400 });
  }
  if (arquivo.size > MAX_TAMANHO_BYTES) {
    return NextResponse.json({ error: 'PDF muito grande (máximo 10MB).' }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const resultado = await parser.getText();
    const texto = resultado.text
      .split(/\r?\n/)
      .filter((linha) => !RE_MARCADOR_PAGINA.test(linha.trim()))
      .join('\n');

    return NextResponse.json({ itens: casarListaComCatalogo(texto) });
  } catch (error) {
    return NextResponse.json({ error: `Não consegui ler esse PDF: ${(error as Error).message}` }, { status: 400 });
  } finally {
    await parser.destroy();
  }
}
