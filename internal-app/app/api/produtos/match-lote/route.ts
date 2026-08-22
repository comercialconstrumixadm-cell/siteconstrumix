import { NextRequest, NextResponse } from 'next/server';
import { buscarProdutos } from '@/lib/db/catalog';
import { parseLista } from '@/lib/orcamento/parseLista';

export const runtime = 'nodejs';

const MAX_LINHAS = 200;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const texto = typeof body?.texto === 'string' ? body.texto : '';

  const linhas = parseLista(texto).slice(0, MAX_LINHAS);

  const itens = linhas.map((linha) => {
    const candidatos = buscarProdutos(linha.descricao, 5);
    return {
      linhaOriginal: linha.linhaOriginal,
      descricaoDetectada: linha.descricao,
      quantidade: linha.quantidade,
      produto: candidatos[0] ?? null,
      candidatos,
    };
  });

  return NextResponse.json({ itens });
}
