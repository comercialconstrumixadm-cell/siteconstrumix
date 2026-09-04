import { getDb } from './client';
import type { LogisticaMensalConfig, MonthlyEntregas } from '../logistica';

export function listEntregasMensal(): MonthlyEntregas[] {
  return getDb()
    .prepare(
      `SELECT year, month, entregas_realizadas as entregasRealizadas
       FROM logistica_mensal ORDER BY year, month`
    )
    .all() as MonthlyEntregas[];
}

export interface LogisticaMensalRow extends LogisticaMensalConfig {
  entregasRealizadas: number;
  observacao: string | null;
}

export function listLogisticaMensal(): LogisticaMensalRow[] {
  const rows = getDb()
    .prepare(
      `SELECT year, month, entregas_realizadas as entregasRealizadas,
              motoristas_ativos as motoristasAtivos, ajudantes_ativos as ajudantesAtivos,
              bateu_meta_manual as bateuMetaManualRaw, observacao
       FROM logistica_mensal ORDER BY year, month`
    )
    .all() as (LogisticaMensalRow & { bateuMetaManualRaw: number | null })[];
  return rows.map(({ bateuMetaManualRaw, ...resto }) => ({
    ...resto,
    bateuMetaManual: bateuMetaManualRaw === null ? null : bateuMetaManualRaw === 1,
  }));
}

export function upsertLogisticaMensal(
  year: number,
  month: number,
  entregasRealizadas: number,
  motoristasAtivos: number,
  ajudantesAtivos: number,
  bateuMetaManual: boolean | null,
  observacao?: string
) {
  getDb()
    .prepare(
      `INSERT INTO logistica_mensal
         (year, month, entregas_realizadas, motoristas_ativos, ajudantes_ativos, bateu_meta_manual, observacao)
       VALUES (@year, @month, @entregasRealizadas, @motoristasAtivos, @ajudantesAtivos, @bateuMetaManual, @observacao)
       ON CONFLICT (year, month) DO UPDATE SET
         entregas_realizadas = excluded.entregas_realizadas,
         motoristas_ativos = excluded.motoristas_ativos,
         ajudantes_ativos = excluded.ajudantes_ativos,
         bateu_meta_manual = excluded.bateu_meta_manual,
         observacao = excluded.observacao,
         atualizado_em = datetime('now')`
    )
    .run({
      year,
      month,
      entregasRealizadas,
      motoristasAtivos,
      ajudantesAtivos,
      bateuMetaManual: bateuMetaManual === null ? null : bateuMetaManual ? 1 : 0,
      observacao: observacao ?? null,
    });
}
