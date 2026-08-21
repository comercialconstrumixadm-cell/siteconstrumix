import { NextRequest, NextResponse } from 'next/server';
import { salvarOrcamento, getOrcamento, listOrcamentos, type NovoOrcamento } from '@/lib/db/orcamentos';
import { gerarPdfOrcamento } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ orcamentos: listOrcamentos() });
}

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
    total,
    observacoes: salvo.observacoes,
  });

  return NextResponse.json({
    id,
    total,
    pdfBase64: Buffer.from(pdfBytes).toString('base64'),
  });
}
