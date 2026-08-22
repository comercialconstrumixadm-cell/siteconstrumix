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
 * PENDENTE: assume que SAMS e New House têm o mesmo desenho de tabelas
 * que a Construmix (mesmo produto Zeus) — ainda não inspecionamos o
 * schema delas diretamente pra confirmar 1:1. Se os nomes de
 * tabela/coluna divergirem, ajustar aqui.
 */
const FATURAMENTO_PEDIDOS_QUERY = `
  SELECT COALESCE(SUM(pv.valortotal), 0) AS total
  FROM prevendas pv
  JOIN prevendas_faturamento pf ON pf.codprevenda = pv.codigo
  WHERE pf.datahora >= $1 AND pf.datahora < $2
`;

export async function getFaturamentoMensalPorEmpresa(empresa: Empresa, year: number, month: number): Promise<number> {
  const { inicio, fim } = monthRange(year, month);
  const rows = await queryZeus<{ total: string }>(empresa, FATURAMENTO_PEDIDOS_QUERY, [inicio, fim]);
  return Number(rows[0]?.total ?? 0);
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
