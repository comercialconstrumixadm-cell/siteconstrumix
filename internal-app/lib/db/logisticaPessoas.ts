import { getDb } from './client';

export type PapelLogistica = 'motorista' | 'ajudante';

export interface LogisticaPessoa {
  id: number;
  nome: string;
  papel: PapelLogistica;
  ativo: boolean;
}

export function listLogisticaPessoas(): LogisticaPessoa[] {
  const rows = getDb()
    .prepare(`SELECT id, nome, papel, ativo FROM logistica_pessoas ORDER BY papel, nome`)
    .all() as { id: number; nome: string; papel: PapelLogistica; ativo: number }[];
  return rows.map((r) => ({ id: r.id, nome: r.nome, papel: r.papel, ativo: r.ativo === 1 }));
}

export function addLogisticaPessoa(nome: string, papel: PapelLogistica) {
  getDb().prepare(`INSERT INTO logistica_pessoas (nome, papel) VALUES (@nome, @papel)`).run({ nome, papel });
}

export function setLogisticaPessoaAtiva(id: number, ativo: boolean) {
  getDb().prepare(`UPDATE logistica_pessoas SET ativo = @ativo WHERE id = @id`).run({ id, ativo: ativo ? 1 : 0 });
}

export function removeLogisticaPessoa(id: number) {
  getDb().prepare(`DELETE FROM logistica_pessoas WHERE id = @id`).run({ id });
}
