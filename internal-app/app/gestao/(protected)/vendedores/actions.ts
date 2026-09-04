'use server';

import { revalidatePath } from 'next/cache';
import { setVendedoresAtivos } from '@/lib/db/vendedores';
import { addVendedorNome, removeVendedorNome, setVendedorNomeAtivo } from '@/lib/db/vendedoresNomes';

export async function salvarVendedoresAtivos(formData: FormData) {
  const year = Number(formData.get('year'));
  const month = Number(formData.get('month'));
  const vendedoresAtivos = Number(formData.get('vendedoresAtivos'));
  const observacao = String(formData.get('observacao') ?? '');
  const crisAtiva = formData.get('crisAtiva') === 'on';

  setVendedoresAtivos(year, month, vendedoresAtivos, observacao || undefined, crisAtiva);
  revalidatePath('/gestao/vendedores');
}

export async function adicionarVendedorNome(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim();
  if (!nome) return;
  addVendedorNome(nome);
  revalidatePath('/gestao/vendedores');
}

export async function alternarVendedorNomeAtivo(formData: FormData) {
  const id = Number(formData.get('id'));
  const ativo = formData.get('ativo') === '1';
  setVendedorNomeAtivo(id, ativo);
  revalidatePath('/gestao/vendedores');
}

export async function apagarVendedorNome(formData: FormData) {
  const id = Number(formData.get('id'));
  removeVendedorNome(id);
  revalidatePath('/gestao/vendedores');
}
