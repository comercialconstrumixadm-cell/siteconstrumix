import { getDb } from './client';

export interface VendedorNome {
  id: number;
  nome: string;
  ativo: boolean;
}

export function listVendedoresNomes(): VendedorNome[] {
  const rows = getDb()
    .prepare(`SELECT id, nome, ativo FROM vendedores_nomes ORDER BY nome`)
    .all() as { id: number; nome: string; ativo: number }[];
  return rows.map((r) => ({ id: r.id, nome: r.nome, ativo: r.ativo === 1 }));
}

export function addVendedorNome(nome: string) {
  getDb().prepare(`INSERT INTO vendedores_nomes (nome) VALUES (@nome)`).run({ nome });
}

export function setVendedorNomeAtivo(id: number, ativo: boolean) {
  getDb().prepare(`UPDATE vendedores_nomes SET ativo = @ativo WHERE id = @id`).run({ id, ativo: ativo ? 1 : 0 });
}

export function removeVendedorNome(id: number) {
  getDb().prepare(`DELETE FROM vendedores_nomes WHERE id = @id`).run({ id });
}
