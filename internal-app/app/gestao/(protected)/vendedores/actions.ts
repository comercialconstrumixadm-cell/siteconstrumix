'use server';

import { revalidatePath } from 'next/cache';
import { setVendedoresAtivos } from '@/lib/db/vendedores';

export async function salvarVendedoresAtivos(formData: FormData) {
  const year = Number(formData.get('year'));
  const month = Number(formData.get('month'));
  const vendedoresAtivos = Number(formData.get('vendedoresAtivos'));
  const observacao = String(formData.get('observacao') ?? '');

  setVendedoresAtivos(year, month, vendedoresAtivos, observacao || undefined);
  revalidatePath('/gestao/vendedores');
}
