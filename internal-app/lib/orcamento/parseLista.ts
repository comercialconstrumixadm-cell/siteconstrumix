import { buscarProdutos, type Produto } from '../db/catalog';

export interface LinhaParseada {
  linhaOriginal: string;
  descricao: string;
  quantidade: number;
}

export interface ItemMatchLista {
  linhaOriginal: string;
  descricaoDetectada: string;
  quantidade: number;
  produto: (Produto & { relevancia: number }) | null;
  candidatos: (Produto & { relevancia: number })[];
}

const MAX_LINHAS = 200;

/** Interpreta o texto (colado ou extraído de um PDF) e casa cada linha com o catálogo. */
export function casarListaComCatalogo(texto: string): ItemMatchLista[] {
  return parseLista(texto)
    .slice(0, MAX_LINHAS)
    .map((linha) => {
      const candidatos = buscarProdutos(linha.descricao, 5);
      return {
        linhaOriginal: linha.linhaOriginal,
        descricaoDetectada: linha.descricao,
        quantidade: linha.quantidade,
        produto: candidatos[0] ?? null,
        candidatos,
      };
    });
}

const RE_QTD_INICIO = /^(\d+(?:[.,]\d+)?)(?:\s*[xX]\s*|\s+)(.+)$/;
const RE_QTD_FIM = /^(.+?)\s*[xX]\s*(\d+(?:[.,]\d+)?)$/;
const RE_QTD_FIM_TRACO = /^(.+?)\s*[-–]\s*(\d+(?:[.,]\d+)?)$/;

function paraNumero(s: string): number {
  const n = Number(s.replace(',', '.'));
  return n > 0 ? n : 1;
}

/**
 * Interpreta uma lista colada (ex: do WhatsApp ou de uma planilha) em linhas
 * de "descrição + quantidade". Aceita "2 cimento CP2 50kg", "cimento CP2 50kg x2",
 * "cimento CP2 50kg - 2", texto colado de planilha (separado por TAB) ou só o
 * nome do produto (assume quantidade 1). É heurística — por isso a quantidade
 * e o produto encontrado ficam sempre editáveis na tela.
 */
export function parseLista(texto: string): LinhaParseada[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linhaOriginal) => {
      if (linhaOriginal.includes('\t')) {
        const partes = linhaOriginal.split('\t').map((p) => p.trim()).filter(Boolean);
        const qtdIdx = partes.findIndex((p) => /^\d+(?:[.,]\d+)?$/.test(p));
        if (qtdIdx !== -1 && partes.length >= 2) {
          const descricao = partes.filter((_, i) => i !== qtdIdx).join(' ');
          return { linhaOriginal, descricao, quantidade: paraNumero(partes[qtdIdx]) };
        }
        return { linhaOriginal, descricao: partes.join(' '), quantidade: 1 };
      }

      let m = linhaOriginal.match(RE_QTD_INICIO);
      if (m) {
        return { linhaOriginal, descricao: m[2].trim(), quantidade: paraNumero(m[1]) };
      }

      m = linhaOriginal.match(RE_QTD_FIM) || linhaOriginal.match(RE_QTD_FIM_TRACO);
      if (m) {
        return { linhaOriginal, descricao: m[1].trim(), quantidade: paraNumero(m[2]) };
      }

      return { linhaOriginal, descricao: linhaOriginal, quantidade: 1 };
    });
}
