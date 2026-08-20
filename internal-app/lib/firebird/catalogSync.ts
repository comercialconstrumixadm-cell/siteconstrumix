import { queryZeus } from './client';
import { upsertProdutos, type Produto } from '../db/catalog';

/**
 * PENDENTE: nome real das tabelas de produto/preço no Zeus (varia conforme
 * a instalação — ver checklist "inspecionar o schema de cada banco
 * primeiro"). A query abaixo é um placeholder que assume colunas
 * CODIGO/DESCRICAO/CATEGORIA/UNIDADE/PRECO — ajustar após inspecionar o
 * schema real de qualquer uma das 3 empresas (o catálogo pode ser
 * consultado a partir de qualquer banco, a definir com Marcos qual é a
 * fonte de verdade).
 *
 * Roda periodicamente (ex: cron/rotina agendada) para manter o índice de
 * busca local (produtos_fts) atualizado sem bater no Firebird de produção
 * a cada busca do balcão.
 */
const PRODUTOS_QUERY = `
  SELECT CODIGO, DESCRICAO, CATEGORIA, UNIDADE, PRECO
  FROM PRODUTOS
`;

export async function sincronizarCatalogo(): Promise<{ total: number }> {
  const rows = await queryZeus<{
    CODIGO: string;
    DESCRICAO: string;
    CATEGORIA: string | null;
    UNIDADE: string | null;
    PRECO: number;
  }>('construmix', PRODUTOS_QUERY);

  const produtos: Produto[] = rows.map((r) => ({
    codigo: String(r.CODIGO),
    nome: r.DESCRICAO,
    categoria: r.CATEGORIA,
    unidade: r.UNIDADE,
    preco: Number(r.PRECO ?? 0),
  }));

  upsertProdutos(produtos);
  return { total: produtos.length };
}
