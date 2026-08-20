import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ItemOrcamento } from './db/orcamentos';

/**
 * PENDENTE: já existe um modelo/identidade visual de PDF de orçamento
 * usado na Construmix — Marcos vai compartilhar o exemplo quando for a
 * hora de implementar essa parte, e este layout deve ser substituído para
 * replicá-lo (cores, logo, cabeçalho/rodapé). O layout abaixo é um
 * placeholder funcional só para não deixar o fluxo do módulo Orçamento sem
 * geração de PDF.
 */
export interface DadosPdfOrcamento {
  id: number;
  criadoEm: string;
  vendedor?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  itens: ItemOrcamento[];
  total: number;
  observacoes?: string;
}

const VERDE_CONSTRUMIX = rgb(0.11, 0.54, 0.18); // aproximação da paleta do site institucional

export async function gerarPdfOrcamento(dados: DadosPdfOrcamento): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = 841.89 - margin;

  page.drawRectangle({ x: 0, y: y - 6, width: 595.28, height: 60, color: VERDE_CONSTRUMIX });
  page.drawText('COMERCIAL CONSTRUMIX', { x: margin, y: y + 18, size: 18, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Orçamento', { x: margin, y: y - 2, size: 11, font, color: rgb(1, 1, 1) });
  y -= 80;

  page.drawText(`Orçamento nº ${dados.id}`, { x: margin, y, size: 11, font: fontBold });
  page.drawText(new Date(dados.criadoEm).toLocaleString('pt-BR'), { x: 400, y, size: 10, font });
  y -= 20;

  if (dados.vendedor) {
    page.drawText(`Vendedor: ${dados.vendedor}`, { x: margin, y, size: 10, font });
    y -= 14;
  }
  if (dados.clienteNome) {
    page.drawText(`Cliente: ${dados.clienteNome}`, { x: margin, y, size: 10, font });
    y -= 14;
  }
  if (dados.clienteTelefone) {
    page.drawText(`Telefone: ${dados.clienteTelefone}`, { x: margin, y, size: 10, font });
    y -= 14;
  }

  y -= 16;
  page.drawLine({ start: { x: margin, y }, end: { x: 595.28 - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 18;

  page.drawText('Produto', { x: margin, y, size: 10, font: fontBold });
  page.drawText('Qtd.', { x: 360, y, size: 10, font: fontBold });
  page.drawText('Unit.', { x: 420, y, size: 10, font: fontBold });
  page.drawText('Total', { x: 490, y, size: 10, font: fontBold });
  y -= 16;

  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  for (const item of dados.itens) {
    if (y < 100) {
      y = 841.89 - margin; // simplificado: sem paginação real ainda
    }
    page.drawText(item.nome.slice(0, 55), { x: margin, y, size: 9, font });
    page.drawText(String(item.quantidade), { x: 360, y, size: 9, font });
    page.drawText(fmt(item.precoUnitario), { x: 420, y, size: 9, font });
    page.drawText(fmt(item.quantidade * item.precoUnitario), { x: 490, y, size: 9, font });
    y -= 16;
  }

  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: 595.28 - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;
  page.drawText('TOTAL', { x: 420, y, size: 12, font: fontBold });
  page.drawText(`R$ ${fmt(dados.total)}`, { x: 490, y, size: 12, font: fontBold });

  if (dados.observacoes) {
    y -= 30;
    page.drawText('Observações:', { x: margin, y, size: 10, font: fontBold });
    y -= 14;
    page.drawText(dados.observacoes.slice(0, 200), { x: margin, y, size: 9, font });
  }

  return pdfDoc.save();
}
