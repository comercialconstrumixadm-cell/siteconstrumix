import { getDb } from './client';
import type { VendedoresAtivosConfig } from '../bonus';

export function listVendedoresAtivos(): VendedoresAtivosConfig[] {
  const rows = getDb()
    .prepare(
      `SELECT year, month, vendedores_ativos as vendedoresAtivos, cris_ativa as crisAtivaRaw
       FROM vendedores_ativos ORDER BY year, month`
    )
    .all() as (VendedoresAtivosConfig & { crisAtivaRaw: number })[];
  return rows.map(({ crisAtivaRaw, ...resto }) => ({ ...resto, crisAtiva: crisAtivaRaw === 1 }));
}

export function setVendedoresAtivos(
  year: number,
  month: number,
  vendedoresAtivos: number,
  observacao?: string,
  crisAtiva = true
) {
  getDb()
    .prepare(
      `INSERT INTO vendedores_ativos (year, month, vendedores_ativos, observacao, cris_ativa)
       VALUES (@year, @month, @vendedoresAtivos, @observacao, @crisAtiva)
       ON CONFLICT (year, month) DO UPDATE SET
         vendedores_ativos = excluded.vendedores_ativos,
         observacao = excluded.observacao,
         cris_ativa = excluded.cris_ativa`
    )
    .run({ year, month, vendedoresAtivos, observacao: observacao ?? null, crisAtiva: crisAtiva ? 1 : 0 });
}
