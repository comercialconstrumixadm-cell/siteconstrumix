import { getDb } from './client';

export interface Produto {
  codigo: string;
  nome: string;
  categoria: string | null;
  unidade: string | null;
  preco: number;
}

export function upsertProdutos(produtos: Produto[]) {
  const stmt = getDb().prepare(
    `INSERT INTO produtos (codigo, nome, categoria, unidade, preco, sincronizado_em)
     VALUES (@codigo, @nome, @categoria, @unidade, @preco, datetime('now'))
     ON CONFLICT (codigo) DO UPDATE SET
       nome = excluded.nome,
       categoria = excluded.categoria,
       unidade = excluded.unidade,
       preco = excluded.preco,
       sincronizado_em = datetime('now')`
  );
  const insertMany = getDb().transaction((rows: Produto[]) => {
    for (const p of rows) stmt.run(p);
  });
  insertMany(produtos);
}

export function countProdutos(): number {
  const row = getDb().prepare(`SELECT COUNT(*) as n FROM produtos`).get() as { n: number };
  return row.n;
}

function expandComSinonimos(termo: string): string[] {
  const rows = getDb()
    .prepare(`SELECT sinonimo FROM sinonimos WHERE termo = @termo COLLATE NOCASE`)
    .all({ termo }) as { sinonimo: string }[];
  return [termo, ...rows.map((r) => r.sinonimo)];
}

/**
 * Busca fuzzy/full-text simples sobre o índice local de produtos (FTS5),
 * com expansão por dicionário de sinônimos (ex: "caixão" -> "marco/batente").
 * Serve de base para o matching do módulo Orçamento; evolui para busca
 * semântica com IA se o volume/qualidade dos nomes do Zeus não for
 * suficiente (ver especificação).
 */
export function buscarProdutos(termoLivre: string, limite = 20): (Produto & { relevancia: number })[] {
  const palavras = termoLivre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((palavra) => expandComSinonimos(palavra));

  if (palavras.length === 0) return [];

  // Cada palavra vai entre aspas antes do "*" (prefixo) — sem isso, palavras
  // com hífen (ex: "CP-II", nome real de cimento) quebram a sintaxe de
  // consulta do FTS5, que trata "-" como operador. Aspas internas (ex: 6")
  // são escapadas dobrando, como o FTS5 exige pra string literal.
  const ftsQuery = palavras
    .filter((p) => p.replace(/[*"]/g, '').length > 0)
    .map((p) => `"${p.replace(/\*/g, '').replace(/"/g, '""')}"*`)
    .join(' OR ');

  if (!ftsQuery) return [];

  const rows = getDb()
    .prepare(
      `SELECT p.codigo, p.nome, p.categoria, p.unidade, p.preco, bm25(produtos_fts) as relevancia
       FROM produtos_fts
       JOIN produtos p ON p.codigo = produtos_fts.codigo
       WHERE produtos_fts MATCH @ftsQuery
       ORDER BY relevancia
       LIMIT @limite`
    )
    .all({ ftsQuery, limite }) as (Produto & { relevancia: number })[];

  return rows;
}

export function addSinonimo(termo: string, sinonimo: string) {
  getDb()
    .prepare(`INSERT OR IGNORE INTO sinonimos (termo, sinonimo) VALUES (@termo, @sinonimo)`)
    .run({ termo: termo.toLowerCase(), sinonimo: sinonimo.toLowerCase() });
}
