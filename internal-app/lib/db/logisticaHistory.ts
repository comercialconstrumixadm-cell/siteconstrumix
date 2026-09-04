import { getDb } from './client';
import type { ResultadoLogisticaMensal } from '../logistica';

export function salvarLogisticaCalculada(resultado: ResultadoLogisticaMensal[]) {
  const stmt = getDb().prepare(
    `INSERT INTO logistica_calculada
       (year, month, entregas_realizadas, meta, bateu_meta, motoristas_ativos, ajudantes_ativos,
        valor_por_motorista, valor_por_ajudante, valor_total_pago, calculado_em)
     VALUES
       (@year, @month, @entregasRealizadas, @meta, @bateuMeta, @motoristasAtivos, @ajudantesAtivos,
        @valorPorMotorista, @valorPorAjudante, @valorTotalPago, datetime('now'))
     ON CONFLICT (year, month) DO UPDATE SET
       entregas_realizadas = excluded.entregas_realizadas,
       meta = excluded.meta,
       bateu_meta = excluded.bateu_meta,
       motoristas_ativos = excluded.motoristas_ativos,
       ajudantes_ativos = excluded.ajudantes_ativos,
       valor_por_motorista = excluded.valor_por_motorista,
       valor_por_ajudante = excluded.valor_por_ajudante,
       valor_total_pago = excluded.valor_total_pago,
       calculado_em = datetime('now')`
  );

  const insertMany = getDb().transaction((rows: ResultadoLogisticaMensal[]) => {
    for (const row of rows) {
      stmt.run({
        ...row,
        bateuMeta: row.bateuMeta === null ? null : row.bateuMeta ? 1 : 0,
      });
    }
  });
  insertMany(resultado);
}
