import { getDb } from './client';
import type { VendedoresAtivosConfig } from '../bonus';

export function listVendedoresAtivos(): VendedoresAtivosConfig[] {
  const rows = getDb()
    .prepare(`SELECT year, month, vendedores_ativos as vendedoresAtivos FROM vendedores_ativos ORDER BY year, month`)
    .all() as VendedoresAtivosConfig[];
  return rows;
}

export function setVendedoresAtivos(year: number, month: number, vendedoresAtivos: number, observacao?: string) {
  getDb()
    .prepare(
      `INSERT INTO vendedores_ativos (year, month, vendedores_ativos, observacao)
       VALUES (@year, @month, @vendedoresAtivos, @observacao)
       ON CONFLICT (year, month) DO UPDATE SET
         vendedores_ativos = excluded.vendedores_ativos,
         observacao = excluded.observacao`
    )
    .run({ year, month, vendedoresAtivos, observacao: observacao ?? null });
}
