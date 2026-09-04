import { queryZeus } from './client';

/**
 * Cadastro de clientes — schema confirmado por inspeção direta em 2026-08.
 * A tabela `clientes` é normalizada (endereço em `clientes_enderecos`,
 * telefone em `clientes_telefones`), mas o Zeus já expõe `vclientes`, uma
 * view pronta com tudo denormalizado (endereço formatado, telefone
 * formatado, CPF/CNPJ formatado) — usamos ela em vez de fazer os 3 JOINs
 * na mão.
 */
export interface ClienteZeus {
  codigo: number;
  nome: string;
  apelido: string | null;
  cpfCnpj: string | null;
  telefone: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  bloqueado: boolean;
}

const BUSCAR_CLIENTES_QUERY = `
  SELECT codigo, nome, apelido,
         cpfcnpjformatado AS "cpfCnpj",
         foneformatado AS telefone,
         endereco_formatado AS endereco,
         bairro, cidade, estado, bloqueado
  FROM vclientes
  WHERE nome ILIKE $1 OR apelido ILIKE $1 OR cpfcnpj ILIKE $1
  ORDER BY nome
  LIMIT $2
`;

export async function buscarClientesZeus(termo: string, limite = 15): Promise<ClienteZeus[]> {
  const padrao = `%${termo.trim()}%`;
  const rows = await queryZeus<{
    codigo: number;
    nome: string;
    apelido: string | null;
    cpfCnpj: string | null;
    telefone: string | null;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    bloqueado: boolean;
  }>('construmix', BUSCAR_CLIENTES_QUERY, [padrao, limite]);
  return rows;
}
