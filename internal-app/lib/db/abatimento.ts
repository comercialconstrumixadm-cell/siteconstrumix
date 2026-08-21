import { getDb } from './client';
import { calcularAbatimento, type MonthlyAbatimento } from '../bonus';

/**
 * Lê a série de ABATIMENTO mensal salva localmente. Hoje é alimentada
 * manualmente (tela Gestão > Faturamento) até o conector Postgres da
 * Construmix (lib/postgres/construmixFaturamento.ts, já com a query real)
 * estar alcançável por rede e passar a gravar aqui via `origem = 'zeus-sync'`.
 */
export function listAbatimentoMensal(): MonthlyAbatimento[] {
  const rows = getDb()
    .prepare(`SELECT year, month, abatimento FROM abatimento_mensal ORDER BY year, month`)
    .all() as MonthlyAbatimento[];
  return rows;
}

export function upsertAbatimentoMensal(
  year: number,
  month: number,
  faturamentoPedidos: number,
  vendasCimento: number,
  origem: 'manual' | 'zeus-sync' = 'manual'
) {
  const abatimento = calcularAbatimento(faturamentoPedidos, vendasCimento);
  getDb()
    .prepare(
      `INSERT INTO abatimento_mensal (year, month, faturamento_pedidos, vendas_cimento, abatimento, origem)
       VALUES (@year, @month, @faturamentoPedidos, @vendasCimento, @abatimento, @origem)
       ON CONFLICT (year, month) DO UPDATE SET
         faturamento_pedidos = excluded.faturamento_pedidos,
         vendas_cimento = excluded.vendas_cimento,
         abatimento = excluded.abatimento,
         origem = excluded.origem,
         atualizado_em = datetime('now')`
    )
    .run({ year, month, faturamentoPedidos, vendasCimento, abatimento, origem });
  return abatimento;
}
