/**
 * Motor de cálculo da bonificação de vendedores (Construmix).
 *
 * Regra fechada com Marcos (ver especificação "Gestão + Orçamento integrado
 * ao Zeus"). Escopo: somente Construmix. Logística está fora do cálculo.
 *
 * 1. ABATIMENTO(mês) = Faturamento de pedidos(mês) - Vendas de cimento(mês)
 * 2. Meta do trimestre = média simples do ABATIMENTO dos 3 meses do
 *    trimestre anterior (móvel, sem meta anual fixa).
 * 3. % Atingido(mês) = ABATIMENTO(mês) / Meta vigente(mês)
 * 4. Multiplicador por faixa de % atingido (tabela abaixo).
 * 5. Bônus total(mês) = Multiplicador x (ABATIMENTO(mês) x 1%)
 * 6. Valor por vendedor = Bônus total / nº de vendedores ativos no mês
 * 7. Cris (administrativo) recebe 50% do valor de UM vendedor (não 50% do total)
 */

export interface MonthlyAbatimento {
  year: number;
  /** 1-12 */
  month: number;
  /** Faturamento de pedidos(mês) - Vendas de cimento(mês) */
  abatimento: number;
}

export interface VendedoresAtivosConfig {
  year: number;
  /** 1-12 */
  month: number;
  vendedoresAtivos: number;
}

export interface FaixaBonus {
  /** limite inferior exclusivo, em fração (ex: 0.40 = 40%) */
  min: number;
  /** limite superior inclusivo, em fração (Infinity para "ou mais") */
  max: number;
  multiplicador: number;
}

/**
 * Tabela de faixas confirmada na planilha. Os limites são tratados como
 * "acima de min até max" (ex: 41-50% -> multiplicador 30% cobre >40% e <=50%).
 */
export const FAIXAS_BONUS: FaixaBonus[] = [
  { min: -Infinity, max: 0.40, multiplicador: 0 },
  { min: 0.40, max: 0.50, multiplicador: 0.30 },
  { min: 0.50, max: 0.60, multiplicador: 0.40 },
  { min: 0.60, max: 0.70, multiplicador: 0.50 },
  { min: 0.70, max: 0.80, multiplicador: 0.60 },
  { min: 0.80, max: 1.00, multiplicador: 0.70 },
  { min: 1.00, max: Infinity, multiplicador: 1.00 },
];

export function calcularAbatimento(faturamentoPedidos: number, vendasCimento: number): number {
  return faturamentoPedidos - vendasCimento;
}

export function getMultiplicador(percentualAtingido: number): number {
  if (percentualAtingido >= 1.0) return 1.0;
  const faixa = FAIXAS_BONUS.find((f) => percentualAtingido > f.min && percentualAtingido <= f.max);
  return faixa ? faixa.multiplicador : 0;
}

function absMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

/**
 * Calcula a meta vigente de cada mês da série com base na média do
 * ABATIMENTO do trimestre (bloco de 3 meses consecutivos) anterior.
 * Os blocos são alinhados a `referenceStartMonth` (padrão: janeiro, ou
 * seja, trimestres civis Jan-Mar / Abr-Jun / Jul-Set / Out-Dez).
 *
 * Retorna null para meses sem trimestre anterior completo na série (não é
 * possível calcular bônus até haver 3 meses de histórico).
 */
export function calcularMetasTrimestrais(
  series: MonthlyAbatimento[],
  referenceStartMonth = 1
): Map<string, number | null> {
  const byMonth = new Map<number, number>();
  for (const item of series) {
    byMonth.set(absMonth(item.year, item.month), item.abatimento);
  }

  const refAbs = referenceStartMonth - 1; // ano de referência 0, só usamos o resto (mod 3 alinhado ao mês)
  const metas = new Map<string, number | null>();

  for (const item of series) {
    const am = absMonth(item.year, item.month);
    const blockIndex = Math.floor((am - refAbs) / 3);
    const blockStart = refAbs + blockIndex * 3;
    const prevBlockStart = blockStart - 3;
    const prevMonths = [prevBlockStart, prevBlockStart + 1, prevBlockStart + 2];

    const key = `${item.year}-${item.month}`;
    const values = prevMonths.map((m) => byMonth.get(m));
    if (values.every((v) => v !== undefined)) {
      const soma = (values as number[]).reduce((a, b) => a + b, 0);
      metas.set(key, soma / 3);
    } else {
      metas.set(key, null);
    }
  }

  return metas;
}

export interface BonusMensal {
  year: number;
  month: number;
  abatimento: number;
  meta: number | null;
  percentualAtingido: number | null;
  multiplicador: number;
  valorTotalBonus: number;
  vendedoresAtivos: number;
  valorPorVendedor: number;
  valorCris: number;
}

/**
 * Calcula o bônus mensal completo (meta, faixa, valor total, valor por
 * vendedor e valor da Cris) para toda a série informada.
 */
export function calcularBonusSerie(
  abatimentos: MonthlyAbatimento[],
  vendedoresConfig: VendedoresAtivosConfig[],
  referenceStartMonth = 1
): BonusMensal[] {
  const metas = calcularMetasTrimestrais(abatimentos, referenceStartMonth);
  const vendedoresPorMes = new Map<string, number>();
  for (const v of vendedoresConfig) {
    vendedoresPorMes.set(`${v.year}-${v.month}`, v.vendedoresAtivos);
  }

  return abatimentos
    .slice()
    .sort((a, b) => absMonth(a.year, a.month) - absMonth(b.year, b.month))
    .map((item) => {
      const key = `${item.year}-${item.month}`;
      const meta = metas.get(key) ?? null;
      const percentualAtingido = meta !== null && meta > 0 ? item.abatimento / meta : null;
      const multiplicador = percentualAtingido !== null ? getMultiplicador(percentualAtingido) : 0;
      const valorTotalBonus = multiplicador * (item.abatimento * 0.01);
      const vendedoresAtivos = vendedoresPorMes.get(key) ?? 0;
      const valorPorVendedor = vendedoresAtivos > 0 ? valorTotalBonus / vendedoresAtivos : 0;
      const valorCris = valorPorVendedor * 0.5;

      return {
        year: item.year,
        month: item.month,
        abatimento: item.abatimento,
        meta,
        percentualAtingido,
        multiplicador,
        valorTotalBonus,
        vendedoresAtivos,
        valorPorVendedor,
        valorCris,
      };
    });
}
