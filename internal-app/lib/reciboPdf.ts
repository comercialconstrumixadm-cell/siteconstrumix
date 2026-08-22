import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { valorPorExtenso } from './numeroExtenso';

const EMPRESA = 'COMERCIAL CONSTRUMIX LTDA';
const CIDADE = 'ARACAJU';

const MESES_EXTENSO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export interface Recibo {
  nome: string;
  valor: number;
  /** Ex: "PRÊMIO MÊS MARÇO" */
  referente: string;
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const PRETO = rgb(0.1, 0.1, 0.1);
const CINZA = rgb(0.35, 0.35, 0.35);

function quebrarLinhas(texto: string, font: PDFFont, size: number, larguraMax: number): string[] {
  const palavras = texto.split(' ');
  const linhas: string[] = [];
  let linhaAtual = '';

  for (const palavra of palavras) {
    const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
    if (font.widthOfTextAtSize(tentativa, size) > larguraMax && linhaAtual) {
      linhas.push(linhaAtual);
      linhaAtual = palavra;
    } else {
      linhaAtual = tentativa;
    }
  }
  if (linhaAtual) linhas.push(linhaAtual);
  return linhas;
}

function dataPorExtenso(data: Date): string {
  return `${CIDADE}, ${data.getDate()} de ${MESES_EXTENSO[data.getMonth()]} de ${data.getFullYear()}`;
}

function desenharRecibo(page: PDFPage, font: PDFFont, fontBold: PDFFont, recibo: Recibo) {
  const margemBox = 60;
  const boxWidth = PAGE_WIDTH - margemBox * 2;
  const boxHeight = 260;
  const boxX = margemBox;
  const boxY = PAGE_HEIGHT - 320;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: PRETO,
    borderWidth: 1.2,
  });

  const padding = 36;
  let y = boxY + boxHeight - padding;

  const titulo = 'Recibo de Pagamento';
  const tituloWidth = fontBold.widthOfTextAtSize(titulo, 15);
  page.drawText(titulo, { x: boxX + (boxWidth - tituloWidth) / 2, y, size: 15, font: fontBold, color: PRETO });

  const valorTexto = recibo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valorFontSize = 13;
  const valorPad = 10;
  const valorWidth = fontBold.widthOfTextAtSize(valorTexto, valorFontSize) + valorPad * 2;
  const valorBoxX = boxX + boxWidth - padding - valorWidth;
  const valorBoxY = y - 6;
  page.drawRectangle({
    x: valorBoxX,
    y: valorBoxY,
    width: valorWidth,
    height: 26,
    borderColor: PRETO,
    borderWidth: 1,
  });
  page.drawText(valorTexto, {
    x: valorBoxX + valorPad,
    y: valorBoxY + 8,
    size: valorFontSize,
    font: fontBold,
    color: PRETO,
  });

  y -= 56;

  const paragrafo1 = `Recebi(emos) de ${EMPRESA}, a importância de ${valorPorExtenso(recibo.valor)}, referente à ${recibo.referente}.`;
  const larguraTexto = boxWidth - padding * 2;
  for (const linha of quebrarLinhas(paragrafo1, font, 10.5, larguraTexto)) {
    page.drawText(linha, { x: boxX + padding, y, size: 10.5, font, color: PRETO });
    y -= 16;
  }

  y -= 6;
  const paragrafo2 =
    'Para maior clareza, firmo(amos) o presente recibo, que comprova o recebimento integral do valor mencionado, concedendo quitação plena, geral e irrevogável pela quantia recebida.';
  for (const linha of quebrarLinhas(paragrafo2, font, 10.5, larguraTexto)) {
    page.drawText(linha, { x: boxX + padding, y, size: 10.5, font, color: PRETO });
    y -= 16;
  }

  const dataTexto = dataPorExtenso(new Date());
  const dataWidth = font.widthOfTextAtSize(dataTexto, 10.5);
  page.drawText(dataTexto, {
    x: boxX + boxWidth - padding - dataWidth,
    y: y - 20,
    size: 10.5,
    font,
    color: PRETO,
  });

  const linhaAssinaturaY = boxY + 46;
  const linhaWidth = 220;
  const linhaX = boxX + (boxWidth - linhaWidth) / 2;
  page.drawLine({
    start: { x: linhaX, y: linhaAssinaturaY },
    end: { x: linhaX + linhaWidth, y: linhaAssinaturaY },
    thickness: 0.8,
    color: CINZA,
  });

  const nomeWidth = fontBold.widthOfTextAtSize(recibo.nome, 10.5);
  page.drawText(recibo.nome, {
    x: boxX + (boxWidth - nomeWidth) / 2,
    y: linhaAssinaturaY - 16,
    size: 10.5,
    font: fontBold,
    color: PRETO,
  });
}

/** Gera um PDF com um recibo de pagamento por página, um pra cada item da lista. */
export async function gerarPdfRecibos(recibos: Recibo[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const recibo of recibos) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    desenharRecibo(page, font, fontBold, recibo);
  }

  return pdfDoc.save();
}
