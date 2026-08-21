import { queryZeus } from './client';
import { monthRange } from './dateRange';

export interface FaturamentoMensal {
  year: number;
  month: number;
  faturamentoPedidos: number;
}

/**
 * "Faturamento de pedidos" da Construmix — confirmado por inspeção direta
 * do schema em 2026-08 (não é o faturamento por nota fiscal, que fica em
 * `saidasnf_faturamento`):
 *
 * - `prevendas` é o pedido (o que a Zeus chama de "prevenda"), com o valor
 *   total (`valortotal`) e o vendedor (`codvendedor`).
 * - `prevendas_faturamento` é só um "carimbo" (codprevenda + datahora +
 *   usuário) marcando quando aquele pedido foi de fato faturado/fechado —
 *   é essa data que define "o mês" do faturamento, não a data do pedido.
 *
 * PENDENTE — validar com o Marcos antes de confiar nos números:
 * cancelamentos e devoluções (tabelas `prevendas_cancelamento` e
 * `prevendas_devolucoes_*`, vistas no schema mas ainda não inspecionadas)
 * provavelmente precisam ser excluídos daqui. Comparar o resultado desta
 * query contra a planilha de referência (META_2026) antes de usar em
 * produção — ver checklist da especificação.
 */
const FATURAMENTO_PEDIDOS_QUERY = `
  SELECT COALESCE(SUM(pv.valortotal), 0) AS total
  FROM prevendas pv
  JOIN prevendas_faturamento pf ON pf.codprevenda = pv.codigo
  WHERE pf.datahora >= $1 AND pf.datahora < $2
`;

export async function getFaturamentoPedidosMensal(year: number, month: number): Promise<number> {
  const { inicio, fim } = monthRange(year, month);
  const rows = await queryZeus<{ total: string }>('construmix', FATURAMENTO_PEDIDOS_QUERY, [inicio, fim]);
  return Number(rows[0]?.total ?? 0);
}

/** Monta a série mensal de faturamento de pedidos (sem descontar cimento ainda) para um intervalo de meses. */
export async function getFaturamentoPedidosSerie(meses: { year: number; month: number }[]): Promise<FaturamentoMensal[]> {
  const resultados: FaturamentoMensal[] = [];
  for (const { year, month } of meses) {
    const total = await getFaturamentoPedidosMensal(year, month);
    resultados.push({ year, month, faturamentoPedidos: total });
  }
  return resultados;
}
