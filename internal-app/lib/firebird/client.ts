import Firebird from 'node-firebird';
import { getFirebirdConfig, type Empresa } from './config';

/**
 * Executa uma query somente leitura em um dos 3 bancos Firebird do Zeus e
 * retorna as linhas. Nunca expor este módulo diretamente ao navegador —
 * ele só deve ser chamado a partir de código de servidor (route handlers /
 * server actions).
 *
 * Lança erro se a empresa não tiver credenciais configuradas em
 * .env.local (ver .env.example) — isso é esperado até Marcos fornecer o
 * acesso real aos 3 bancos.
 */
export function queryZeus<T = Record<string, unknown>>(empresa: Empresa, sql: string, params: unknown[] = []): Promise<T[]> {
  const config = getFirebirdConfig(empresa);
  if (!config) {
    return Promise.reject(
      new Error(
        `Conexão Firebird da empresa "${empresa}" não configurada. ` +
          `Preencha FIREBIRD_${empresa.toUpperCase()}_* em .env.local (ver .env.example).`
      )
    );
  }

  return new Promise((resolve, reject) => {
    Firebird.attach(config, (attachErr, db) => {
      if (attachErr) return reject(attachErr);

      db.query(sql, params, (queryErr, result) => {
        db.detach();
        if (queryErr) return reject(queryErr);
        resolve((result ?? []) as T[]);
      });
    });
  });
}
