import { queryZeus } from './client';
import { upsertProdutos, type Produto } from '../db/catalog';

/**
 * Catálogo de produtos — schema confirmado por inspeção direta em 2026-08:
 * `produtos` (catálogo principal, ~6.000+ itens) com `grupos` (categoria,
 * ex: "CIMENTO", "PISOS", "TINTAS") via `produtos.codgrupo`.
 *
 * Roda periodicamente (ex: cron/rotina agendada) para manter o índice de
 * busca local (produtos_fts) atualizado sem bater no Postgres de produção
 * a cada busca do balcão.
 */
const PRODUTOS_QUERY = `
  SELECT p.codigo, p.nome, g.nome AS categoria, p.unidade, p.precovenda AS preco
  FROM produtos p
  LEFT JOIN grupos g ON g.codigo = p.codgrupo
  WHERE p.desativado IS NOT TRUE
  ORDER BY p.codigo
`;

export async function sincronizarCatalogo(): Promise<{ total: number }> {
  const rows = await queryZeus<{
    codigo: number;
    nome: string;
    categoria: string | null;
    unidade: string | null;
    preco: string | null;
  }>('construmix', PRODUTOS_QUERY);

  const produtos: Produto[] = rows.map((r) => ({
    codigo: String(r.codigo),
    nome: r.nome,
    categoria: r.categoria,
    unidade: r.unidade,
    preco: Number(r.preco ?? 0),
  }));

  upsertProdutos(produtos);
  return { total: produtos.length };
}
