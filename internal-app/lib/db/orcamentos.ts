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

export interface FiltroOrcamentos {
  clienteNome?: string;
  dataInicio?: string; // 'YYYY-MM-DD'
  dataFim?: string; // 'YYYY-MM-DD'
  limite?: number;
}

export function listOrcamentos(filtro: FiltroOrcamentos = {}) {
  const { clienteNome, dataInicio, dataFim, limite = 100 } = filtro;

  const condicoes: string[] = [];
  const params: Record<string, unknown> = { limite };

  if (clienteNome) {
    condicoes.push('cliente_nome LIKE @clienteNome COLLATE NOCASE');
    params.clienteNome = `%${clienteNome}%`;
  }
  if (dataInicio) {
    condicoes.push('date(criado_em) >= date(@dataInicio)');
    params.dataInicio = dataInicio;
  }
  if (dataFim) {
    condicoes.push('date(criado_em) <= date(@dataFim)');
    params.dataFim = dataFim;
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

  return getDb()
    .prepare(`${SELECT_ORCAMENTO} ${where} ORDER BY id DESC LIMIT @limite`)
    .all(params);
}

export function getOrcamento(id: number) {
  return getDb()
    .prepare(`${SELECT_ORCAMENTO} WHERE id = @id`)
    .get({ id });
}
