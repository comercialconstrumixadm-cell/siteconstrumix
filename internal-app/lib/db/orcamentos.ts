import { getDb } from './client';

export interface ItemOrcamento {
  codigo: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface NovoOrcamento {
  vendedor?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  itens: ItemOrcamento[];
  observacoes?: string;
}

export function salvarOrcamento(orcamento: NovoOrcamento) {
  const total = orcamento.itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);
  const info = getDb()
    .prepare(
      `INSERT INTO orcamentos (vendedor, cliente_nome, cliente_telefone, itens_json, total, observacoes)
       VALUES (@vendedor, @clienteNome, @clienteTelefone, @itensJson, @total, @observacoes)`
    )
    .run({
      vendedor: orcamento.vendedor ?? null,
      clienteNome: orcamento.clienteNome ?? null,
      clienteTelefone: orcamento.clienteTelefone ?? null,
      itensJson: JSON.stringify(orcamento.itens),
      total,
      observacoes: orcamento.observacoes ?? null,
    });
  return { id: info.lastInsertRowid as number, total };
}

export function listOrcamentos(limite = 50) {
  return getDb()
    .prepare(
      `SELECT id, criado_em as criadoEm, vendedor, cliente_nome as clienteNome,
              cliente_telefone as clienteTelefone, itens_json as itensJson, total, observacoes
       FROM orcamentos ORDER BY id DESC LIMIT @limite`
    )
    .all({ limite });
}

export function getOrcamento(id: number) {
  return getDb()
    .prepare(
      `SELECT id, criado_em as criadoEm, vendedor, cliente_nome as clienteNome,
              cliente_telefone as clienteTelefone, itens_json as itensJson, total, observacoes
       FROM orcamentos WHERE id = @id`
    )
    .get({ id });
}
