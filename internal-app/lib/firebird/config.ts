export type Empresa = 'construmix' | 'sams' | 'newhouse';

export interface FirebirdConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  lowercase_keys?: boolean;
}

function readConfig(empresa: Empresa, prefix: string): FirebirdConnectionConfig | null {
  const host = process.env[`FIREBIRD_${prefix}_HOST`];
  const database = process.env[`FIREBIRD_${prefix}_DATABASE`];
  const user = process.env[`FIREBIRD_${prefix}_USER`];
  const password = process.env[`FIREBIRD_${prefix}_PASSWORD`];
  const port = Number(process.env[`FIREBIRD_${prefix}_PORT`] ?? 3050);

  if (!host || !database || !user || !password) {
    return null;
  }

  return { host, port, database, user, password, lowercase_keys: true };
}

/**
 * Configuração das 3 conexões Firebird do Zeus (uma por empresa, mesma
 * máquina física, .fdb diferentes). Retorna `null` para uma empresa sem
 * credenciais configuradas em .env.local — os módulos que dependem dela
 * devem tratar esse caso (dado ainda não disponível, ver README).
 */
export function getFirebirdConfig(empresa: Empresa): FirebirdConnectionConfig | null {
  const prefixes: Record<Empresa, string> = {
    construmix: 'CONSTRUMIX',
    sams: 'SAMS',
    newhouse: 'NEWHOUSE',
  };
  return readConfig(empresa, prefixes[empresa]);
}
