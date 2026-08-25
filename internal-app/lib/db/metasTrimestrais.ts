import { getDb } from './client';
import { blockKey } from '../bonus';

export interface MetaOverride {
  blockYear: number;
  blockMonth: number;
  meta: number;
}

/** Todos os overrides de meta lançados, como um Map pronto pra passar pro motor de cálculo (ver lib/bonus.ts). */
export function getMetasOverrideMap(): Map<string, number> {
  const rows = getDb()
    .prepare(`SELECT block_year as blockYear, block_month as blockMonth, meta FROM metas_trimestrais_override`)
    .all() as MetaOverride[];
  const mapa = new Map<string, number>();
  for (const row of rows) {
    mapa.set(blockKey(row.blockYear * 12 + (row.blockMonth - 1)), row.meta);
  }
  return mapa;
}

export function listMetasOverride(): MetaOverride[] {
  return getDb()
    .prepare(
      `SELECT block_year as blockYear, block_month as blockMonth, meta
       FROM metas_trimestrais_override ORDER BY block_year, block_month`
    )
    .all() as MetaOverride[];
}

export function setMetaOverride(blockYear: number, blockMonth: number, meta: number) {
  getDb()
    .prepare(
      `INSERT INTO metas_trimestrais_override (block_year, block_month, meta)
       VALUES (@blockYear, @blockMonth, @meta)
       ON CONFLICT (block_year, block_month) DO UPDATE SET
         meta = excluded.meta,
         atualizado_em = datetime('now')`
    )
    .run({ blockYear, blockMonth, meta });
}
