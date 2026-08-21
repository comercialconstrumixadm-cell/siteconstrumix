import { Pool } from 'pg';
import { getPostgresConfig, type Empresa } from './config';

const pools = new Map<Empresa, Pool>();

function getPool(empresa: Empresa): Pool {
  const cached = pools.get(empresa);
  if (cached) return cached;

  const config = getPostgresConfig(empresa);
  if (!config) {
    throw new Error(
      `Conexão Postgres da empresa "${empresa}" não configurada. ` +
        `Preencha POSTGRES_${empresa.toUpperCase()}_* em .env.local (ver .env.example).`
    );
  }

  const pool = new Pool({ ...config, max: 5 });
  pools.set(empresa, pool);
  return pool;
}

/**
 * Executa uma query somente leitura em um dos 3 bancos Postgres do Zeus
 * (usuário de consulta, dedicado, com acesso restrito — ver .env.example)
 * e retorna as linhas. Nunca expor este módulo diretamente ao navegador —
 * ele só deve ser chamado a partir de código de servidor (route handlers /
 * server actions).
 */
export async function queryZeus<T extends Record<string, unknown> = Record<string, unknown>>(
  empresa: Empresa,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool(empresa);
  const result = await pool.query<T>(sql, params);
  return result.rows;
}
