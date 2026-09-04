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
 * 7. Crislaine Santos (administrativo) recebe 50% do valor de UM vendedor (não 50% do total)
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
  /** Se a Crislaine Santos (administrativo) participa da bonificação desse mês. Padrão: true. */
  crisAtiva?: boolean;
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

function blockStartFor(am: number, refAbs: number): number {
  const blockIndex = Math.floor((am - refAbs) / 3);
  return refAbs + blockIndex * 3;
}

/** Chave estável (ano-mês do primeiro mês do trimestre) pra indexar overrides de meta. */
export function blockKey(blockStart: number): string {
  const year = Math.floor(blockStart / 12);
  const month = (blockStart % 12) + 1;
  return `${year}-${month}`;
}

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Ex: "Dez/2025 – Fev/2026", pra exibir de qual trimestre uma meta é. */
export function blockLabel(blockStart: number): string {
  const primeiro = blockStart;
  const ultimo = blockStart + 2;
  const anoPrimeiro = Math.floor(primeiro / 12);
  const mesPrimeiro = (primeiro % 12) + 1;
  const anoUltimo = Math.floor(ultimo / 12);
  const mesUltimo = (ultimo % 12) + 1;
  return `${MESES_ABREV[mesPrimeiro - 1]}/${anoPrimeiro} – ${MESES_ABREV[mesUltimo - 1]}/${anoUltimo}`;
}

/**
 * Calcula a meta vigente de cada mês da série com base na média do
 * ABATIMENTO do trimestre (bloco de 3 meses consecutivos) anterior.
 * Os blocos são alinhados a `referenceStartMonth` (padrão: janeiro, ou
 * seja, trimestres civis Jan-Mar / Abr-Jun / Jul-Set / Out-Dez).
 *
 * Se `overrides` tiver uma meta lançada manualmente pro trimestre de um
 * item (chave = `blockKey` do início do trimestre daquele item), ela vale
 * no lugar da média calculada — permite o Marcos corrigir a meta de um
 * trimestre específico sem mexer no histórico de ABATIMENTO.
 *
 * Retorna null para meses sem trimestre anterior completo na série e sem
 * override (não é possível calcular bônus até haver 3 meses de histórico).
 */
export function calcularMetasTrimestrais(
  series: MonthlyAbatimento[],
  referenceStartMonth = 1,
  overrides?: Map<string, number>
): Map<string, number | null> {
  const byMonth = new Map<number, number>();
  for (const item of series) {
    byMonth.set(absMonth(item.year, item.month), item.abatimento);
  }

  const refAbs = referenceStartMonth - 1; // ano de referência 0, só usamos o resto (mod 3 alinhado ao mês)
  const metas = new Map<string, number | null>();

  for (const item of series) {
    const am = absMonth(item.year, item.month);
    const blockStart = blockStartFor(am, refAbs);
    const key = `${item.year}-${item.month}`;

    const override = overrides?.get(blockKey(blockStart));
    if (override !== undefined) {
      metas.set(key, override);
      continue;
    }

    const prevBlockStart = blockStart - 3;
    const prevMonths = [prevBlockStart, prevBlockStart + 1, prevBlockStart + 2];
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

export interface MetaVigenteInfo {
  /** Meta do trimestre em andamento (a que vale agora). */
  metaAtual: number | null;
  blockAtualLabel: string;
  /** Sugestão automática pro próximo trimestre: média do trimestre atual arredondada pra múltiplo de R$5.000. */
  proximaMetaSugerida: number | null;
  /** Meta lançada manualmente pro próximo trimestre, se houver. */
  proximaMetaOverride: number | null;
  /** O que vale de fato pro próximo trimestre: override se existir, senão a sugestão. */
  metaProximoTrimestre: number | null;
  blockProximoLabel: string;
  /** Chave pra salvar/consultar o override do próximo trimestre. */
  blockProximoKey: string;
}

/**
 * Meta do trimestre em andamento (hoje) + sugestão arredondada pra R$5.000
 * do próximo trimestre, com base na média do trimestre atual (só fica
 * disponível quando os 3 meses do trimestre atual já estão lançados).
 */
export function getMetaVigente(
  abatimentos: MonthlyAbatimento[],
  referenceDate: Date,
  referenceStartMonth = 12,
  overrides?: Map<string, number>
): MetaVigenteInfo {
  const byMonth = new Map<number, number>();
  for (const item of abatimentos) {
    byMonth.set(absMonth(item.year, item.month), item.abatimento);
  }

  const refAbs = referenceStartMonth - 1;
  const amAtual = absMonth(referenceDate.getFullYear(), referenceDate.getMonth() + 1);
  const blockStartAtual = blockStartFor(amAtual, refAbs);
  const blockStartAnterior = blockStartAtual - 3;
  const blockStartProximo = blockStartAtual + 3;

  const overrideAtual = overrides?.get(blockKey(blockStartAtual)) ?? null;
  let metaAtual: number | null = overrideAtual;
  if (metaAtual === null) {
    const valoresAnteriores = [0, 1, 2].map((i) => byMonth.get(blockStartAnterior + i));
    metaAtual = valoresAnteriores.every((v) => v !== undefined)
      ? (valoresAnteriores as number[]).reduce((a, b) => a + b, 0) / 3
      : null;
  }

  const valoresAtuais = [0, 1, 2].map((i) => byMonth.get(blockStartAtual + i));
  const mediaAtual = valoresAtuais.every((v) => v !== undefined)
    ? (valoresAtuais as number[]).reduce((a, b) => a + b, 0) / 3
    : null;
  const proximaMetaSugerida = mediaAtual !== null ? Math.round(mediaAtual / 5000) * 5000 : null;
  const proximaMetaOverride = overrides?.get(blockKey(blockStartProximo)) ?? null;

  return {
    metaAtual,
    blockAtualLabel: blockLabel(blockStartAtual),
    proximaMetaSugerida,
    proximaMetaOverride,
    metaProximoTrimestre: proximaMetaOverride ?? proximaMetaSugerida,
    blockProximoLabel: blockLabel(blockStartProximo),
    blockProximoKey: blockKey(blockStartProximo),
  };
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
 * vendedor e valor da Crislaine Santos) para toda a série informada.
 */
export function calcularBonusSerie(
  abatimentos: MonthlyAbatimento[],
  vendedoresConfig: VendedoresAtivosConfig[],
  referenceStartMonth = 1,
  overrides?: Map<string, number>
): BonusMensal[] {
  const metas = calcularMetasTrimestrais(abatimentos, referenceStartMonth, overrides);
  const vendedoresPorMes = new Map<string, number>();
  const crisAtivaPorMes = new Map<string, boolean>();
  for (const v of vendedoresConfig) {
    const key = `${v.year}-${v.month}`;
    vendedoresPorMes.set(key, v.vendedoresAtivos);
    crisAtivaPorMes.set(key, v.crisAtiva ?? true);
  }

  return abatimentos
    .slice()
    .sort((a, b) => absMonth(a.year, a.month) - absMonth(b.year, b.month))
    .map((item) => {
      const key = `${item.year}-${item.month}`;
      const meta = metas.get(key) ?? null;
      const percentualAtingido = meta !== null && meta > 0 ? item.abatimento / meta : null;
      const multiplicador = percentualAtingido !== null ? getMultiplicador(percentualAtingido) : 0;
      // Valores em reais, sem centavos (pedido do Marcos) — arredonda em
      // cada nível (total, por vendedor, Crislaine) pra ficar redondo em
      // todos eles, não só no total.
      const valorTotalBonus = Math.round(multiplicador * (item.abatimento * 0.01));
      const vendedoresAtivos = vendedoresPorMes.get(key) ?? 0;
      const valorPorVendedor = vendedoresAtivos > 0 ? Math.round(valorTotalBonus / vendedoresAtivos) : 0;
      const crisAtiva = crisAtivaPorMes.get(key) ?? true;
      const valorCris = crisAtiva ? Math.round(valorPorVendedor * 0.5) : 0;

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
