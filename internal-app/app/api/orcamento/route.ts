import { NextRequest, NextResponse } from 'next/server';
import { salvarOrcamento, getOrcamento, type NovoOrcamento } from '@/lib/db/orcamentos';
import { gerarPdfOrcamento } from '@/lib/pdf';

export const runtime = 'nodejs';

/**
 * Sem GET aqui de propósito: /orcamento/historico lê listOrcamentos() direto
 * no servidor (server component), não precisa de uma rota de API pra isso.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as NovoOrcamento;

  if (!body.itens || body.itens.length === 0) {
    return NextResponse.json({ error: 'Orçamento precisa de ao menos um item.' }, { status: 400 });
  }

  const { id, total } = salvarOrcamento(body);
  const salvo = getOrcamento(id) as any;

  const pdfBytes = await gerarPdfOrcamento({
    id,
    criadoEm: salvo.criadoEm,
    vendedor: salvo.vendedor,
    clienteNome: salvo.clienteNome,
    clienteTelefone: salvo.clienteTelefone,
    clienteEndereco: salvo.clienteEndereco,
    itens: JSON.parse(salvo.itensJson),
    desconto: salvo.desconto ?? 0,
    formaPagamento: salvo.formaPagamento,
    validoPorDias: salvo.validadeDias ?? 10,
    total,
    observacoes: salvo.observacoes,
  });

  return NextResponse.json({
    id,
    total,
    pdfBase64: Buffer.from(pdfBytes).toString('base64'),
  });
}
