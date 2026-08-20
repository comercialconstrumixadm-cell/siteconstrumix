import { queryZeus } from './client';

export interface FaturamentoMensal {
  year: number;
  month: number;
  faturamentoPedidos: number;
}

/**
 * PENDENTE (bloqueador para ligar a bonificação aos dados reais do Zeus):
 *
 * Marcos precisa apontar qual tabela/view do Zeus corresponde ao relatório
 * "faturamento de pedidos" da Construmix — é diferente do faturamento por
 * nota fiscal (NF). Sem isso não é possível escrever a query real nem
 * validar os números contra a planilha de referência.
 *
 * Quando o relatório for identificado:
 *   1. Preencher FIREBIRD_CONSTRUMIX_FATURAMENTO_PEDIDOS_QUERY em .env.local
 *      (ou substituir a query abaixo diretamente, se for fixa).
 *   2. Implementar getFaturamentoPedidosMensal usando queryZeus('construmix', sql).
 *   3. Cruzar com getVendasCimentoMensal (cimentoFilter.ts) para calcular o
 *      ABATIMENTO real (lib/bonus.ts) e substituir os dados manuais de
 *      lib/db/abatimento.ts por sincronização automática.
 */
export async function getFaturamentoPedidosMensal(_year: number, _month: number): Promise<number> {
  const sql = process.env.FIREBIRD_CONSTRUMIX_FATURAMENTO_PEDIDOS_QUERY;
  if (!sql) {
    throw new Error(
      'Relatório "faturamento de pedidos" ainda não identificado no Zeus. ' +
        'Ver lib/firebird/construmixFaturamento.ts e o checklist da especificação.'
    );
  }

  const rows = await queryZeus<{ TOTAL: number }>('construmix', sql, [_year, _month]);
  return rows[0]?.TOTAL ?? 0;
}

/**
 * Monta a série mensal de faturamento de pedidos (sem descontar cimento
 * ainda) para um intervalo de meses. Depende de getFaturamentoPedidosMensal
 * estar implementada de verdade (ver PENDENTE acima).
 */
export async function getFaturamentoPedidosSerie(meses: { year: number; month: number }[]): Promise<FaturamentoMensal[]> {
  const resultados: FaturamentoMensal[] = [];
  for (const { year, month } of meses) {
    const total = await getFaturamentoPedidosMensal(year, month);
    resultados.push({ year, month, faturamentoPedidos: total });
  }
  return resultados;
}
