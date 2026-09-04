import { queryZeus } from './client';
import { monthRange } from './dateRange';
import type { Empresa } from './config';

/**
 * Faturamento de pedidos, genérico para qualquer uma das 3 empresas —
 * mesma query confirmada no schema da Construmix (ver
 * construmixFaturamento.ts para a explicação completa de por que
 * `prevendas` + `prevendas_faturamento` é o jeito certo, diferente do
 * faturamento por nota fiscal).
 *
 * Sem o filtro de forma de pagamento, essa consulta somava TUDO que tem
 * registro em prevendas_faturamento no mês — validado contra o relatório
 * "Faturamento de Vendas" (Pré-vendas) do Zeus pra julho/2026: sem filtro
 * deu R$ 1.126.434,74 (2045 pré-vendas) contra R$ 263.830,32 no relatório
 * real (4,3x errado). Com o filtro de forma de pagamento abaixo (o mesmo
 * usado no relatório do Zeus) deu R$ 268.448,05 (1683) — ~1,7% acima do
 * relatório, resíduo provavelmente de itens que não são "Mercadoria para
 * Revenda" dentro de pré-vendas mistas (ainda não filtrado aqui).
 *
 * SAMS e New House confirmadas com o mesmo desenho de tabelas da Construmix
 * (Marcos, 2026-08) — acesso liberado nos 3 bancos.
 *
 * PENDENTE:
 * - os códigos de FORMAS_PAGAMENTO_VALIDAS abaixo foram lidos direto da
 *   tela da Construmix — ainda não confirmado se SAMS/New House usam os
 *   mesmos códigos numéricos pras mesmas formas de pagamento (é
 *   configuração por empresa, não estrutura de tabela).
 * - resíduo de ~1,7% não investigado (provável filtro por tipo de item
 *   faltando, precisaria de prevendasprod).
 */
const FORMAS_PAGAMENTO_VALIDAS = [1, 7, 8, 9, 19, 20, 21, 22, 23, 26, 29, 31, 32, 33, 36, 39];

const FATURAMENTO_PEDIDOS_QUERY = `
  SELECT COALESCE(SUM(pv.valortotal), 0) AS total, COUNT(*) AS quantidade
  FROM prevendas pv
  JOIN prevendas_faturamento pf ON pf.codprevenda = pv.codigo
  WHERE pf.datahora >= $1 AND pf.datahora < $2
    AND pv.codpagamento = ANY($3::int[])
`;

export interface FaturamentoDetalhado {
  faturamento: number;
  quantidadeVendas: number;
}

export async function getFaturamentoDetalhadoMensalPorEmpresa(
  empresa: Empresa,
  year: number,
  month: number
): Promise<FaturamentoDetalhado> {
  const { inicio, fim } = monthRange(year, month);
  const rows = await queryZeus<{ total: string; quantidade: string }>(empresa, FATURAMENTO_PEDIDOS_QUERY, [
    inicio,
    fim,
    FORMAS_PAGAMENTO_VALIDAS,
  ]);
  return {
    faturamento: Number(rows[0]?.total ?? 0),
    quantidadeVendas: Number(rows[0]?.quantidade ?? 0),
  };
}

export async function getFaturamentoMensalPorEmpresa(empresa: Empresa, year: number, month: number): Promise<number> {
  return (await getFaturamentoDetalhadoMensalPorEmpresa(empresa, year, month)).faturamento;
}

export interface FaturamentoMensalEmpresa {
  empresa: Empresa;
  year: number;
  month: number;
  /** Presente quando a consulta falhou (empresa sem credenciais, erro de conexão, etc). */
  erro?: string;
  /** Ausente quando `erro` está presente. */
  faturamento?: number;
}

/**
 * Monta a série mensal de faturamento para as 3 empresas, para um
 * intervalo de meses. Cada combinação empresa/mês é isolada: se uma
 * empresa não estiver configurada (ver lib/postgres/config.ts) ou a
 * consulta falhar, essa combinação vem com `erro` preenchido em vez de
 * derrubar a série inteira — as outras empresas/meses continuam normais.
 */
export async function getFaturamentoComparativo(
  empresas: Empresa[],
  meses: { year: number; month: number }[]
): Promise<FaturamentoMensalEmpresa[]> {
  const combinacoes = empresas.flatMap((empresa) => meses.map((mes) => ({ empresa, ...mes })));

  return Promise.all(
    combinacoes.map(async ({ empresa, year, month }): Promise<FaturamentoMensalEmpresa> => {
      try {
        const faturamento = await getFaturamentoMensalPorEmpresa(empresa, year, month);
        return { empresa, year, month, faturamento };
      } catch (error) {
        return { empresa, year, month, erro: (error as Error).message };
      }
    })
  );
}
