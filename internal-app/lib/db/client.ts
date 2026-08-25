import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let db: Database.Database | null = null;

/**
 * Retorna a conexão (singleton) com o banco de dados próprio da aplicação.
 * Não confundir com os bancos PostgreSQL do Zeus (ver lib/postgres).
 */
export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.APP_DB_PATH ?? './data/app.sqlite';
  const resolved = path.resolve(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });

  db = new Database(resolved);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Lido a partir do cwd (e não de __dirname) porque o Next.js empacota o
  // código do servidor e __dirname aponta para dentro de .next/server, não
  // para lib/db.
  const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  aplicarMigracoes(db);

  return db;
}

/**
 * `CREATE TABLE IF NOT EXISTS` no schema.sql não adiciona colunas novas a
 * uma tabela que já existe (ex: um app.sqlite de uma versão anterior) —
 * sem isso, atualizar o código quebraria qualquer banco local já criado.
 * Migração idempotente e bem pequena: só roda o `ALTER TABLE` se a coluna
 * ainda não existir.
 */
function adicionarColunasFaltantes(db: Database.Database, tabela: string, colunas: [string, string][]) {
  const colunasExistentes = new Set(
    (db.pragma(`table_info('${tabela}')`) as { name: string }[]).map((c) => c.name)
  );
  for (const [coluna, tipo] of colunas) {
    if (!colunasExistentes.has(coluna)) {
      db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${tipo}`);
    }
  }
}

function aplicarMigracoes(db: Database.Database) {
  adicionarColunasFaltantes(db, 'orcamentos', [
    ['cliente_endereco', 'TEXT'],
    ['desconto', 'REAL NOT NULL DEFAULT 0'],
    ['forma_pagamento', 'TEXT'],
    ['validade_dias', 'INTEGER NOT NULL DEFAULT 10'],
  ]);
  adicionarColunasFaltantes(db, 'vendedores_ativos', [['cris_ativa', 'INTEGER NOT NULL DEFAULT 1']]);
}
