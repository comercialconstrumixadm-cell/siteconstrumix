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

  return db;
}
