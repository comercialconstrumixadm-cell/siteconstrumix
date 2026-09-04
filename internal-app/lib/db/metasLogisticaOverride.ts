import { getDb } from './client';
import { blockKey } from '../logistica';

export interface MetaLogisticaOverride {
  blockYear: number;
  blockMonth: number;
  meta: number;
}

/** Todos os overrides de meta de entregas lançados, prontos pra passar pro motor de cálculo (ver lib/logistica.ts). */
export function getMetasLogisticaOverrideMap(): Map<string, number> {
  const rows = getDb()
    .prepare(`SELECT block_year as blockYear, block_month as blockMonth, meta FROM metas_logistica_override`)
    .all() as MetaLogisticaOverride[];
  const mapa = new Map<string, number>();
  for (const row of rows) {
    mapa.set(blockKey(row.blockYear * 12 + (row.blockMonth - 1)), row.meta);
  }
  return mapa;
}

export function setMetaLogisticaOverride(blockYear: number, blockMonth: number, meta: number) {
  getDb()
    .prepare(
      `INSERT INTO metas_logistica_override (block_year, block_month, meta)
       VALUES (@blockYear, @blockMonth, @meta)
       ON CONFLICT (block_year, block_month) DO UPDATE SET
         meta = excluded.meta,
         atualizado_em = datetime('now')`
    )
    .run({ blockYear, blockMonth, meta });
}
