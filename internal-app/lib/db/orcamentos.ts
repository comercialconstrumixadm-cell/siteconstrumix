import { getDb } from './client';

export interface ItemOrcamento {
  codigo: string;
  nome: string;
  unidade?: string;
  quantidade: number;
  precoUnitario: number;
}

export interface NovoOrcamento {
  vendedor?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  itens: ItemOrcamento[];
  desconto?: number;
  formaPagamento?: string;
  observacoes?: string;
}

export function salvarOrcamento(orcamento: NovoOrcamento) {
  const subtotal = orcamento.itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);
  const desconto = orcamento.desconto ?? 0;
  const total = Math.max(0, subtotal - desconto);

  const info = getDb()
    .prepare(
      `INSERT INTO orcamentos
         (vendedor, cliente_nome, cliente_telefone, cliente_endereco, itens_json, desconto, forma_pagamento, total, observacoes)
       VALUES
         (@vendedor, @clienteNome, @clienteTelefone, @clienteEndereco, @itensJson, @desconto, @formaPagamento, @total, @observacoes)`
    )
    .run({
      vendedor: orcamento.vendedor ?? null,
      clienteNome: orcamento.clienteNome ?? null,
      clienteTelefone: orcamento.clienteTelefone ?? null,
      clienteEndereco: orcamento.clienteEndereco ?? null,
      itensJson: JSON.stringify(orcamento.itens),
      desconto,
      formaPagamento: orcamento.formaPagamento ?? null,
      total,
      observacoes: orcamento.observacoes ?? null,
    });
  return { id: info.lastInsertRowid as number, subtotal, desconto, total };
}

const SELECT_ORCAMENTO = `
  SELECT id, criado_em as criadoEm, vendedor, cliente_nome as clienteNome,
         cliente_telefone as clienteTelefone, cliente_endereco as clienteEndereco,
         itens_json as itensJson, desconto, forma_pagamento as formaPagamento,
         total, observacoes
  FROM orcamentos
`;

export function listOrcamentos(limite = 50) {
  return getDb()
    .prepare(`${SELECT_ORCAMENTO} ORDER BY id DESC LIMIT @limite`)
    .all({ limite });
}

export function getOrcamento(id: number) {
  return getDb()
    .prepare(`${SELECT_ORCAMENTO} WHERE id = @id`)
    .get({ id });
}
