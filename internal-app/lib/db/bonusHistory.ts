import { getDb } from './client';
import type { BonusMensal } from '../bonus';

export function salvarBonusCalculado(resultado: BonusMensal[]) {
  const stmt = getDb().prepare(
    `INSERT INTO bonificacao_calculada
       (year, month, abatimento, meta, percentual_atingido, multiplicador,
        valor_total_bonus, vendedores_ativos, valor_por_vendedor, valor_cris, calculado_em)
     VALUES
       (@year, @month, @abatimento, @meta, @percentualAtingido, @multiplicador,
        @valorTotalBonus, @vendedoresAtivos, @valorPorVendedor, @valorCris, datetime('now'))
     ON CONFLICT (year, month) DO UPDATE SET
       abatimento = excluded.abatimento,
       meta = excluded.meta,
       percentual_atingido = excluded.percentual_atingido,
       multiplicador = excluded.multiplicador,
       valor_total_bonus = excluded.valor_total_bonus,
       vendedores_ativos = excluded.vendedores_ativos,
       valor_por_vendedor = excluded.valor_por_vendedor,
       valor_cris = excluded.valor_cris,
       calculado_em = datetime('now')`
  );

  const insertMany = getDb().transaction((rows: BonusMensal[]) => {
    for (const row of rows) stmt.run(row);
  });
  insertMany(resultado);
}

export function listBonusHistorico() {
  return getDb()
    .prepare(
      `SELECT year, month, abatimento, meta, percentual_atingido as percentualAtingido,
              multiplicador, valor_total_bonus as valorTotalBonus,
              vendedores_ativos as vendedoresAtivos, valor_por_vendedor as valorPorVendedor,
              valor_cris as valorCris, calculado_em as calculadoEm
       FROM bonificacao_calculada ORDER BY year, month`
    )
    .all();
}
