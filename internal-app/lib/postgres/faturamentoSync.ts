import { getFaturamentoPedidosMensal } from './construmixFaturamento';
import { getVendasCimentoMensal } from './cimentoFilter';
import { upsertAbatimentoMensal } from '../db/abatimento';
import { getDb } from '../db/client';

function absMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function fromAbsMonth(abs: number): { year: number; month: number } {
  return { year: Math.floor(abs / 12), month: (abs % 12) + 1 };
}

function getOrigemLancada(year: number, month: number): string | null {
  const row = getDb()
    .prepare(`SELECT origem FROM abatimento_mensal WHERE year = ? AND month = ?`)
    .get(year, month) as { origem: string } | undefined;
  return row?.origem ?? null;
}

/**
 * Preenche automaticamente o ABATIMENTO (Faturamento de pedidos - Vendas de
 * cimento) dos meses recentes direto do Zeus, sem precisar de lançamento
 * manual — resolve o problema de "só aparece o mês que eu digitei", já que
 * antes um mês novo só existia depois de alguém abrir Faturamento e
 * cadastrar na mão.
 *
 * Regra: preenche qualquer mês do intervalo que ainda não tenha nenhum
 * lançamento, e sempre RE-sincroniza o mês corrente (ele ainda está em
 * andamento, os números mudam a cada venda faturada durante o mês) — mas
 * nunca sobrescreve um mês marcado como `origem = 'manual'` (correção
 * deliberada feita na tela). Chamado antes de exibir Faturamento e antes
 * de calcular a bonificação, pra sempre refletir dados recentes sem exigir
 * lançamento mês a mês.
 */
export async function sincronizarAbatimentoRecente(mesesParaTras = 3): Promise<void> {
  const hoje = new Date();
  const atualAbs = absMonth(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1);

  for (let i = mesesParaTras; i >= 0; i--) {
    const abs = atualAbs - i;
    const { year, month } = fromAbsMonth(abs);
    const origemAtual = getOrigemLancada(year, month);
    const ehMesCorrente = abs === atualAbs;
    const deveSincronizar = origemAtual === null || (ehMesCorrente && origemAtual === 'zeus-sync');
    if (!deveSincronizar) continue;

    try {
      const [faturamentoPedidos, vendasCimento] = await Promise.all([
        getFaturamentoPedidosMensal(year, month),
        getVendasCimentoMensal(year, month),
      ]);
      upsertAbatimentoMensal(year, month, faturamentoPedidos, vendasCimento, 'zeus-sync');
    } catch {
      // Zeus indisponível ou não configurado — silencioso, mantém o que já
      // existia localmente (a tela continua mostrando o que já tinha).
    }
  }
}
