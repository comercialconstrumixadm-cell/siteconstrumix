import { queryZeus } from './client';
import { monthRange } from './dateRange';
import type { Empresa } from './config';

/**
 * Faturamento Fiscal = soma das notas fiscais com situação "Autorizada",
 * por data de emissão — confirmado por inspeção direta do schema em
 * 2026-08 e validado batendo 1:1 com o filtro manual "Gerenciar notas
 * fiscais eletrônicas" do Zeus (Situação = Autorizada, Emissão = mês):
 * R$ 435.295,15 em 72 notas em ambos, pro mesmo mês.
 *
 * - `saidasnf` é a nota fiscal em si (`valortotalnota`, `dataemissao`).
 * - `nfeinfo` guarda o status de transmissão pra SEFAZ de cada nota
 *   (`situacao`, ligada por `codsaidasnf`); `nfeinfo_situacao` traduz o
 *   código: 2 = Autorizada (1 Assinada, 3 Cancelada, 4 Denegada, 5 Em
 *   Processamento na SEFAZ, 6 Nenhuma, 7 Rejeitada, 8 Transmitida com
 *   pendência, 9 Validada, 10 Inutilizada).
 *
 * SAMS e New House confirmadas com o mesmo desenho de tabelas da Construmix
 * (Marcos, 2026-08) — acesso liberado nos 3 bancos, mesma query serve pras
 * 3 empresas.
 */
const SITUACAO_AUTORIZADA = 2;

const FATURAMENTO_FISCAL_QUERY = `
  SELECT COALESCE(SUM(sf.valortotalnota), 0) AS total, COUNT(*) AS quantidade
  FROM saidasnf sf
  JOIN nfeinfo ni ON ni.codsaidasnf = sf.codigo
  WHERE sf.dataemissao >= $1 AND sf.dataemissao < $2
    AND ni.situacao = ${SITUACAO_AUTORIZADA}
`;

export interface FaturamentoFiscalDetalhado {
  faturamento: number;
  quantidadeNotas: number;
}

export async function getFaturamentoFiscalDetalhadoMensal(
  empresa: Empresa,
  year: number,
  month: number
): Promise<FaturamentoFiscalDetalhado> {
  const { inicio, fim } = monthRange(year, month);
  const rows = await queryZeus<{ total: string; quantidade: string }>(empresa, FATURAMENTO_FISCAL_QUERY, [inicio, fim]);
  return {
    faturamento: Number(rows[0]?.total ?? 0),
    quantidadeNotas: Number(rows[0]?.quantidade ?? 0),
  };
}

export interface FaturamentoFiscalMensalEmpresa {
  empresa: Empresa;
  year: number;
  month: number;
  erro?: string;
  faturamento?: number;
  quantidadeNotas?: number;
}

export async function getFaturamentoFiscalComparativo(
  empresas: Empresa[],
  meses: { year: number; month: number }[]
): Promise<FaturamentoFiscalMensalEmpresa[]> {
  const combinacoes = empresas.flatMap((empresa) => meses.map((mes) => ({ empresa, ...mes })));

  return Promise.all(
    combinacoes.map(async ({ empresa, year, month }): Promise<FaturamentoFiscalMensalEmpresa> => {
      try {
        const detalhe = await getFaturamentoFiscalDetalhadoMensal(empresa, year, month);
        return { empresa, year, month, faturamento: detalhe.faturamento, quantidadeNotas: detalhe.quantidadeNotas };
      } catch (error) {
        return { empresa, year, month, erro: (error as Error).message };
      }
    })
  );
}
