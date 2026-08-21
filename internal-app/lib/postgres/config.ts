export type Empresa = 'construmix' | 'sams' | 'newhouse';

export interface PostgresConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Nome real de cada banco no Postgres do Zeus (confirmado inspecionando o
 * schema): um servidor Postgres só, servindo as 3 empresas em bancos
 * separados. Também existem `_images` (fotos de produto) e `_zupdate`
 * (controle interno do Zeus) para cada empresa — não são usados aqui.
 */
const DATABASE_NAME: Record<Empresa, string> = {
  construmix: 'base_construmix',
  sams: 'base_samscomercio',
  newhouse: 'base_newhouse',
};

function readConfig(empresa: Empresa, prefix: string): PostgresConnectionConfig | null {
  const host = process.env[`POSTGRES_${prefix}_HOST`];
  const user = process.env[`POSTGRES_${prefix}_USER`];
  const password = process.env[`POSTGRES_${prefix}_PASSWORD`];
  const port = Number(process.env[`POSTGRES_${prefix}_PORT`] ?? 5432);
  const database = process.env[`POSTGRES_${prefix}_DATABASE`] || DATABASE_NAME[empresa];

  if (!host || !user || !password) {
    return null;
  }

  return { host, port, database, user, password };
}

/**
 * Configuração das 3 conexões Postgres do Zeus (uma por empresa, mesmo
 * servidor Postgres, bancos diferentes — confirmado por inspeção direta do
 * schema em 2026-08). Retorna `null` para uma empresa sem credenciais
 * configuradas em .env.local — os módulos que dependem dela devem tratar
 * esse caso (dado ainda não disponível, ver README).
 *
 * Em produção este app roda dentro da própria loja, na mesma rede local do
 * Postgres — então o HOST aqui deve ser o IP local desse servidor (ex:
 * 192.168.x.x), nunca `127.0.0.1` (que só funciona rodando na própria
 * máquina do Postgres) nem exposto à internet.
 */
export function getPostgresConfig(empresa: Empresa): PostgresConnectionConfig | null {
  const prefixes: Record<Empresa, string> = {
    construmix: 'CONSTRUMIX',
    sams: 'SAMS',
    newhouse: 'NEWHOUSE',
  };
  return readConfig(empresa, prefixes[empresa]);
}
