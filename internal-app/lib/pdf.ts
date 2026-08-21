import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
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
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89; // A4
const MARGIN = 48;
const RODAPE_Y = 40;

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function gerarPdfOrcamento(dados: DadosPdfOrcamento): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page!: PDFPage;
  let y = 0;
  let paginaNumero = 0;

  function novaPagina() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    paginaNumero += 1;
    y = PAGE_HEIGHT - MARGIN;

    page.drawRectangle({ x: 0, y: y - 6, width: PAGE_WIDTH, height: 60, color: VERDE_CONSTRUMIX });
    page.drawText('COMERCIAL CONSTRUMIX', { x: MARGIN, y: y + 18, size: 18, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Orçamento', { x: MARGIN, y: y - 2, size: 11, font, color: rgb(1, 1, 1) });
    y -= 80;

    if (paginaNumero > 1) {
      page.drawText(`Orçamento nº ${dados.id} (continuação)`, { x: MARGIN, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 24;
      desenharCabecalhoTabela();
    }
  }

  function desenharRodape() {
    page.drawText(`Página ${paginaNumero}`, { x: PAGE_WIDTH - MARGIN - 50, y: RODAPE_Y, size: 8, font, color: rgb(0.55, 0.55, 0.55) });
  }

  /** Garante espaço vertical suficiente na página atual, criando uma nova se necessário. */
  function garantirEspaco(alturaNecessaria: number) {
    if (y - alturaNecessaria < RODAPE_Y + 20) {
      desenharRodape();
      novaPagina();
    }
  }

  function desenharCabecalhoTabela() {
    page.drawText('Produto', { x: MARGIN, y, size: 10, font: fontBold });
    page.drawText('Qtd.', { x: 360, y, size: 10, font: fontBold });
    page.drawText('Unit.', { x: 420, y, size: 10, font: fontBold });
    page.drawText('Total', { x: 490, y, size: 10, font: fontBold });
    y -= 16;
  }

  novaPagina();

  page.drawText(`Orçamento nº ${dados.id}`, { x: MARGIN, y, size: 11, font: fontBold });
  page.drawText(new Date(dados.criadoEm).toLocaleString('pt-BR'), { x: 400, y, size: 10, font });
  y -= 20;

  if (dados.vendedor) {
    page.drawText(`Vendedor: ${dados.vendedor}`, { x: MARGIN, y, size: 10, font });
    y -= 14;
  }
  if (dados.clienteNome) {
    page.drawText(`Cliente: ${dados.clienteNome}`, { x: MARGIN, y, size: 10, font });
    y -= 14;
  }
  if (dados.clienteTelefone) {
    page.drawText(`Telefone: ${dados.clienteTelefone}`, { x: MARGIN, y, size: 10, font });
    y -= 14;
  }

  y -= 16;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 18;

  desenharCabecalhoTabela();

  const ALTURA_LINHA = 16;
  for (const item of dados.itens) {
    garantirEspaco(ALTURA_LINHA);
    page.drawText(item.nome.slice(0, 55), { x: MARGIN, y, size: 9, font });
    page.drawText(String(item.quantidade), { x: 360, y, size: 9, font });
    page.drawText(fmt(item.precoUnitario), { x: 420, y, size: 9, font });
    page.drawText(fmt(item.quantidade * item.precoUnitario), { x: 490, y, size: 9, font });
    y -= ALTURA_LINHA;
  }

  garantirEspaco(30);
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;
  page.drawText('TOTAL', { x: 420, y, size: 12, font: fontBold });
  page.drawText(`R$ ${fmt(dados.total)}`, { x: 490, y, size: 12, font: fontBold });

  if (dados.observacoes) {
    garantirEspaco(44);
    y -= 30;
    page.drawText('Observações:', { x: MARGIN, y, size: 10, font: fontBold });
    y -= 14;
    page.drawText(dados.observacoes.slice(0, 200), { x: MARGIN, y, size: 9, font });
  }

  desenharRodape();

  return pdfDoc.save();
}
