'use server';

import { revalidatePath } from 'next/cache';
import { addLogisticaPessoa, removeLogisticaPessoa, setLogisticaPessoaAtiva, type PapelLogistica } from '@/lib/db/logisticaPessoas';
import { upsertLogisticaMensal } from '@/lib/db/logisticaMensal';

export async function adicionarLogisticaPessoa(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim();
  const papel = String(formData.get('papel') ?? '') as PapelLogistica;
  if (!nome || (papel !== 'motorista' && papel !== 'ajudante')) return;
  addLogisticaPessoa(nome, papel);
  revalidatePath('/gestao/logistica');
}

export async function alternarLogisticaPessoaAtiva(formData: FormData) {
  const id = Number(formData.get('id'));
  const ativo = formData.get('ativo') === '1';
  setLogisticaPessoaAtiva(id, ativo);
  revalidatePath('/gestao/logistica');
}

export async function apagarLogisticaPessoa(formData: FormData) {
  const id = Number(formData.get('id'));
  removeLogisticaPessoa(id);
  revalidatePath('/gestao/logistica');
}

export async function salvarLogisticaMensal(formData: FormData) {
  const year = Number(formData.get('year'));
  const month = Number(formData.get('month'));
  const entregasRealizadas = Number(formData.get('entregasRealizadas'));
  const motoristasAtivos = Number(formData.get('motoristasAtivos'));
  const ajudantesAtivos = Number(formData.get('ajudantesAtivos'));
  const observacao = String(formData.get('observacao') ?? '');

  const bateuMetaRaw = String(formData.get('bateuMetaManual') ?? 'auto');
  const bateuMetaManual = bateuMetaRaw === 'sim' ? true : bateuMetaRaw === 'nao' ? false : null;

  upsertLogisticaMensal(year, month, entregasRealizadas, motoristasAtivos, ajudantesAtivos, bateuMetaManual, observacao || undefined);
  revalidatePath('/gestao/logistica');
}
