import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { ItemOrcamento } from './db/orcamentos';

/**
 * Layout replicado a partir de um orçamento real impresso pelo Zeus
 * (modelo compartilhado pelo Marcos em 2026-08): logo + cabeçalho da loja,
 * dados do cliente, tabela de itens com linha pontilhada entre produtos,
 * subtotal/desconto/total, condições e assinatura, rodapé com endereço.
 *
 * Dados fixos da loja (extraídos do modelo real — trocar se a matriz/CNPJ
 * usado no orçamento for diferente do cadastro no Zeus):
 */
const LOJA = {
  nome: 'COMERCIAL CONSTRUMIX',
  cnpj: '30.506.256/0001-36',
  inscricaoEstadual: '271605200',
  endereco: 'RUA SIMEAO AGUIAR, 147, JOSE CONRADO DE ARAUJO, ARACAJU - SE, CEP: 49085-410',
  telefone: '(79)3304-4798',
};

/** Ícone de casa usado no site institucional (components/BrandLogo.tsx), desenhado como SVG path. */
const LOGO_PATH_TELHADO = 'M4 14L16 5l12 9v13H4z';
const LOGO_PATH_JANELAS = 'M11 27V18h4v9M19 27V21h4v6';

export interface DadosPdfOrcamento {
  id: number;
  criadoEm: string;
  vendedor?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  itens: ItemOrcamento[];
  desconto: number;
  formaPagamento?: string;
  total: number;
  observacoes?: string;
  /** Dias de validade do orçamento a partir da criação (padrão: 7). */
  validoPorDias?: number;
}

const VERDE = rgb(0.11, 0.54, 0.18);
const CINZA_ESCURO = rgb(0.2, 0.2, 0.2);
const CINZA_MEDIO = rgb(0.45, 0.45, 0.45);
const CINZA_CLARO = rgb(0.75, 0.75, 0.75);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89; // A4
const MARGIN = 40;
const RODAPE_Y = 34;

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function gerarPdfOrcamento(dados: DadosPdfOrcamento): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page!: PDFPage;
  let y = 0;
  let paginaNumero = 0;

  const alignRight = (text: string, xEnd: number, yPos: number, size: number, f: PDFFont, color = CINZA_ESCURO) => {
    const width = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: xEnd - width, y: yPos, size, font: f, color });
  };

  const rightText = (text: string, yPos: number, size: number, f: PDFFont, color = CINZA_ESCURO) =>
    alignRight(text, PAGE_WIDTH - MARGIN, yPos, size, f, color);

  const centerText = (text: string, yPos: number, size: number, f: PDFFont, color = CINZA_ESCURO) => {
    const width = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y: yPos, size, font: f, color });
  };

  const dottedLine = (x1: number, x2: number, yPos: number) => {
    const step = 3;
    for (let x = x1; x < x2; x += step) {
      page.drawLine({ start: { x, y: yPos }, end: { x: x + 1, y: yPos }, thickness: 0.6, color: CINZA_CLARO });
    }
  };

  function novaPagina() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    paginaNumero += 1;
    y = PAGE_HEIGHT - MARGIN;

    if (paginaNumero === 1) {
      // Logo (mesmo ícone de casa do site institucional), centralizado
      // verticalmente com o texto ao lado (drawSvgPath ancora no canto
      // inferior esquerdo da caixa delimitadora do path, tipo drawImage).
      page.drawSvgPath(LOGO_PATH_TELHADO, { x: MARGIN, y: y - 21.5, scale: 1, borderColor: VERDE, borderWidth: 1.6 });
      page.drawSvgPath(LOGO_PATH_JANELAS, { x: MARGIN, y: y - 21.5, scale: 1, borderColor: VERDE, borderWidth: 1.6 });
      page.drawText('COMERCIAL', { x: MARGIN + 34, y: y - 6, size: 8, font, color: VERDE });
      page.drawText('CONSTRUMIX', { x: MARGIN + 34, y: y - 18, size: 13, font: fontBold, color: VERDE });

      centerText(`Orçamento - ${dados.id}`, y - 8, 19, fontBold, CINZA_ESCURO);

      rightText(LOJA.nome, y, 10, fontBold);
      rightText(`CPF/CNPJ: ${LOJA.cnpj}`, y - 12, 8, font, CINZA_MEDIO);
      rightText(`Inscrição Estadual: ${LOJA.inscricaoEstadual}`, y - 22, 8, font, CINZA_MEDIO);
      rightText(new Date(dados.criadoEm).toLocaleDateString('pt-BR'), y - 36, 11, fontBold);
      if (dados.vendedor) {
        rightText(`Vendedor: ${dados.vendedor}`, y - 48, 9, fontBold);
      }

      y -= 60;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: CINZA_ESCURO });
      y -= 16;

      if (dados.clienteNome) {
        page.drawText('Cliente: ', { x: MARGIN, y, size: 9, font: fontBold, color: CINZA_ESCURO });
        page.drawText(dados.clienteNome, { x: MARGIN + 40, y, size: 9, font, color: CINZA_ESCURO });
        y -= 13;
      }
      if (dados.clienteEndereco) {
        page.drawText('Endereço: ', { x: MARGIN, y, size: 9, font: fontBold, color: CINZA_ESCURO });
        page.drawText(dados.clienteEndereco.slice(0, 90), { x: MARGIN + 46, y, size: 9, font, color: CINZA_ESCURO });
        y -= 13;
      }
      if (dados.clienteTelefone) {
        page.drawText('Telefone: ', { x: MARGIN, y, size: 9, font: fontBold, color: CINZA_ESCURO });
        page.drawText(dados.clienteTelefone, { x: MARGIN + 44, y, size: 9, font, color: CINZA_ESCURO });
        y -= 13;
      }

      y -= 4;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.5, color: CINZA_CLARO });
      rightText('Valores em R$ 1,00', y - 10, 7, font, CINZA_MEDIO);
      y -= 22;

      desenharCabecalhoTabela();
    } else {
      page.drawText(`Orçamento nº ${dados.id} (continuação)`, { x: MARGIN, y, size: 9, font, color: CINZA_MEDIO });
      y -= 20;
      desenharCabecalhoTabela();
    }
  }

  function desenharRodape() {
    page.drawLine({ start: { x: MARGIN, y: RODAPE_Y + 14 }, end: { x: PAGE_WIDTH - MARGIN, y: RODAPE_Y + 14 }, thickness: 0.5, color: CINZA_CLARO });
    page.drawText(`${LOJA.endereco} - ${LOJA.telefone}`, { x: MARGIN, y: RODAPE_Y, size: 7, font, color: CINZA_MEDIO });
    rightText(`Página ${paginaNumero}`, RODAPE_Y, 7, font, CINZA_MEDIO);
  }

  function garantirEspaco(alturaNecessaria: number) {
    if (y - alturaNecessaria < RODAPE_Y + 24) {
      desenharRodape();
      novaPagina();
    }
  }

  const COL_PRODUTO = MARGIN;
  const COL_UNIDADE = 350;
  const COL_QTD_R = 400;
  const COL_UNIT_R = 470;
  const COL_TOTAL_R = PAGE_WIDTH - MARGIN;

  function desenharCabecalhoTabela() {
    page.drawText('Informações do produto', { x: COL_PRODUTO, y, size: 8, font: fontBold, color: CINZA_ESCURO });
    page.drawText('Unid.', { x: COL_UNIDADE, y, size: 8, font: fontBold, color: CINZA_ESCURO });
    page.drawText('Qtde.', { x: COL_QTD_R - fontBold.widthOfTextAtSize('Qtde.', 8), y, size: 8, font: fontBold, color: CINZA_ESCURO });
    page.drawText('Unitário R$', { x: COL_UNIT_R - fontBold.widthOfTextAtSize('Unitário R$', 8), y, size: 8, font: fontBold, color: CINZA_ESCURO });
    page.drawText('Total R$', { x: COL_TOTAL_R - fontBold.widthOfTextAtSize('Total R$', 8), y, size: 8, font: fontBold, color: CINZA_ESCURO });
    y -= 6;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: CINZA_ESCURO });
    y -= 14;
  }

  novaPagina();

  const ALTURA_LINHA = 15;
  let quantidadeTotal = 0;
  for (const item of dados.itens) {
    garantirEspaco(ALTURA_LINHA);
    quantidadeTotal += item.quantidade;

    page.drawText(`${item.codigo} - ${item.nome}`.slice(0, 62), { x: COL_PRODUTO, y, size: 8.5, font, color: CINZA_ESCURO });
    page.drawText(item.unidade ?? 'UN', { x: COL_UNIDADE, y, size: 8.5, font, color: CINZA_ESCURO });
    const qtdTxt = String(item.quantidade);
    page.drawText(qtdTxt, { x: COL_QTD_R - font.widthOfTextAtSize(qtdTxt, 8.5), y, size: 8.5, font, color: CINZA_ESCURO });
    const unitTxt = fmt(item.precoUnitario);
    page.drawText(unitTxt, { x: COL_UNIT_R - font.widthOfTextAtSize(unitTxt, 8.5), y, size: 8.5, font, color: CINZA_ESCURO });
    const totalItemTxt = fmt(item.quantidade * item.precoUnitario);
    page.drawText(totalItemTxt, { x: COL_TOTAL_R - fontBold.widthOfTextAtSize(totalItemTxt, 8.5), y, size: 8.5, font: fontBold, color: CINZA_ESCURO });

    y -= 5;
    dottedLine(MARGIN, PAGE_WIDTH - MARGIN, y);
    y -= ALTURA_LINHA - 5;
  }

  garantirEspaco(90);
  page.drawText(`Número de ítens: ${dados.itens.length}`, { x: MARGIN, y, size: 8, font: fontBold, color: CINZA_ESCURO });
  page.drawText(`Quantidade Total: ${quantidadeTotal}`, { x: MARGIN + 130, y, size: 8, font: fontBold, color: CINZA_ESCURO });
  y -= 20;

  const COL_TOTAIS_LABEL = 440;

  const subtotal = dados.itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);
  alignRight('Subtotal:', COL_TOTAIS_LABEL, y, 10, fontBold);
  alignRight(fmt(subtotal), COL_TOTAL_R, y, 10, font);
  y -= 16;

  if (dados.desconto > 0) {
    const pct = subtotal > 0 ? (dados.desconto / subtotal) * 100 : 0;
    alignRight('Desconto (-):', COL_TOTAIS_LABEL, y, 10, fontBold);
    alignRight(`${fmt(dados.desconto)} (${fmtPct(pct)}%)`, COL_TOTAL_R, y, 10, font);
    y -= 16;
  }

  y -= 4;
  page.drawLine({ start: { x: 320, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: CINZA_ESCURO });
  y -= 20;
  alignRight('TOTAL', COL_TOTAIS_LABEL, y, 14, fontBold);
  alignRight(`R$ ${fmt(dados.total)}`, COL_TOTAL_R, y, 14, fontBold, VERDE);

  const validade = new Date(dados.criadoEm);
  validade.setDate(validade.getDate() + (dados.validoPorDias ?? 7));
  page.drawText(`• Válido até: ${validade.toLocaleDateString('pt-BR')}`, { x: MARGIN, y, size: 8.5, font, color: CINZA_ESCURO });
  y -= 13;
  page.drawText('• Previsão de entrega: A combinar', { x: MARGIN, y, size: 8.5, font, color: CINZA_ESCURO });
  y -= 24;

  if (dados.formaPagamento) {
    page.drawText('Forma de pagamento:', { x: MARGIN, y, size: 8.5, font: fontBold, color: CINZA_ESCURO });
    page.drawText(dados.formaPagamento, { x: MARGIN + 100, y, size: 8.5, font, color: CINZA_ESCURO });
    y -= 24;
  }

  if (dados.observacoes) {
    garantirEspaco(40);
    page.drawText('Observações:', { x: MARGIN, y, size: 9, font: fontBold, color: CINZA_ESCURO });
    y -= 13;
    page.drawText(dados.observacoes.slice(0, 200), { x: MARGIN, y, size: 8.5, font, color: CINZA_ESCURO });
    y -= 24;
  }

  garantirEspaco(50);
  y -= 20;
  const linhaAssinaturaX1 = PAGE_WIDTH / 2 - 100;
  const linhaAssinaturaX2 = PAGE_WIDTH / 2 + 100;
  page.drawLine({ start: { x: linhaAssinaturaX1, y }, end: { x: linhaAssinaturaX2, y }, thickness: 0.75, color: CINZA_ESCURO });
  y -= 12;
  centerText('Assinatura', y, 8.5, font, CINZA_MEDIO);

  desenharRodape();

  return pdfDoc.save();
}
