import { getFaturamentoMensalPorEmpresa } from './faturamentoPorEmpresa';

export interface FaturamentoMensal {
  year: number;
  month: number;
  faturamentoPedidos: number;
}

/**
 * "Faturamento de pedidos" da Construmix, usado no cálculo do ABATIMENTO
 * (ver lib/bonus.ts) — confirmado por inspeção direta do schema em
 * 2026-08 (não é o faturamento por nota fiscal, que fica em
 * `saidasnf_faturamento`):
 *
 * - `prevendas` é o pedido (o que a Zeus chama de "prevenda"), com o valor
 *   total (`valortotal`) e o vendedor (`codvendedor`).
 * - `prevendas_faturamento` é só um "carimbo" (codprevenda + datahora +
 *   usuário) marcando quando aquele pedido foi de fato faturado/fechado —
 *   é essa data que define "o mês" do faturamento, não a data do pedido.
 *
 * A query em si é genérica (ver lib/postgres/faturamentoPorEmpresa.ts,
 * também usada pelos comparativos entre empresas); este módulo só fixa a
 * empresa em "construmix", que é a única usada na bonificação.
 *
 * PENDENTE — validar com o Marcos antes de confiar nos números:
 * cancelamentos e devoluções (tabelas `prevendas_cancelamento` e
 * `prevendas_devolucoes_*`, vistas no schema mas ainda não inspecionadas)
 * provavelmente precisam ser excluídos daqui. Comparar o resultado desta
 * query contra a planilha de referência (META_2026) antes de usar em
 * produção — ver checklist da especificação.
 */
export async function getFaturamentoPedidosMensal(year: number, month: number): Promise<number> {
  return getFaturamentoMensalPorEmpresa('construmix', year, month);
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
