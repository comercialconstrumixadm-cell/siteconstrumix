'use server';

import { revalidatePath } from 'next/cache';
import { upsertAbatimentoMensal } from '@/lib/db/abatimento';

export async function salvarFaturamentoMensal(formData: FormData) {
  const year = Number(formData.get('year'));
  const month = Number(formData.get('month'));
  const faturamentoPedidos = Number(formData.get('faturamentoPedidos'));
  const vendasCimento = Number(formData.get('vendasCimento'));

  upsertAbatimentoMensal(year, month, faturamentoPedidos, vendasCimento, 'manual');
  revalidatePath('/gestao/faturamento');
}
