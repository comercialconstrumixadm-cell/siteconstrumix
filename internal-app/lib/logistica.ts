/**
 * Motor de cálculo da bonificação de logística (motoristas e ajudantes).
 *
 * Módulo separado da bonificação de vendedores (ver lib/bonus.ts) — mesma
 * lógica de trimestre (meta = média do trimestre civil anterior, blocos
 * Dez-Jan-Fev/Mar-Abr-Mai/...), mas o valor pago é diferente: aqui não tem
 * faixa de multiplicador, é fixo + variável só se bateu a meta de entregas
 * do trimestre (regra fechada com o Marcos em 2026-08).
 *
 * Motoristas: R$110,00 fixo + R$0,50 por entrega realizada, se bateu a meta.
 * Ajudantes: R$82,50 fixo + R$0,50 por entrega realizada, se bateu a meta.
 * Se não bateu a meta, cada um recebe só o valor fixo.
 */

export const VALOR_FIXO_MOTORISTA = 110;
export const VALOR_FIXO_AJUDANTE = 82.5;
export const VALOR_POR_ENTREGA = 0.5;

export interface MonthlyEntregas {
  year: number;
  /** 1-12 */
  month: number;
  entregasRealizadas: number;
}

export interface LogisticaMensalConfig {
  year: number;
  /** 1-12 */
  month: number;
  motoristasAtivos: number;
  ajudantesAtivos: number;
  /** null/undefined = decide automático (entregas >= meta); true/false = override manual do Marcos. */
  bateuMetaManual?: boolean | null;
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
 * Calcula a meta de entregas de cada mês da série com base na média das
 * entregas realizadas do trimestre anterior — mesmo mecanismo de
 * `calcularMetasTrimestrais` em lib/bonus.ts, mas em quantidade de
 * entregas, não R$. Aceita overrides manuais por trimestre (chave =
 * `blockKey` do início do trimestre).
 */
export function calcularMetasTrimestraisEntregas(
  series: MonthlyEntregas[],
  referenceStartMonth = 1,
  overrides?: Map<string, number>
): Map<string, number | null> {
  const byMonth = new Map<number, number>();
  for (const item of series) {
    byMonth.set(absMonth(item.year, item.month), item.entregasRealizadas);
  }

  const refAbs = referenceStartMonth - 1;
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
      metas.set(key, Math.round(soma / 3));
    } else {
      metas.set(key, null);
    }
  }

  return metas;
}

export interface MetaVigenteEntregasInfo {
  /** Meta do trimestre em andamento. Sem histórico prévio, só existe se lançada manualmente. */
  metaAtual: number | null;
  blockAtualLabel: string;
  /** Meta lançada manualmente pro trimestre atual, se houver. */
  metaAtualOverride: number | null;
  /** Sugestão automática pro próximo trimestre: média de entregas do trimestre atual. */
  proximaMetaSugerida: number | null;
  proximaMetaOverride: number | null;
  metaProximoTrimestre: number | null;
  blockProximoLabel: string;
  blockAtualKey: string;
  blockProximoKey: string;
}

/**
 * Meta de entregas do trimestre em andamento (hoje) + sugestão pro próximo
 * trimestre, com base na média de entregas do trimestre atual (só fica
 * disponível quando os 3 meses do trimestre atual já estão lançados).
 * Sem nenhum override e sem histórico completo, `metaAtual` fica null —
 * é preciso lançar manualmente a primeira vez (não tem trimestre anterior
 * pra calcular a média).
 */
export function getMetaVigenteEntregas(
  entregas: MonthlyEntregas[],
  referenceDate: Date,
  referenceStartMonth = 12,
  overrides?: Map<string, number>
): MetaVigenteEntregasInfo {
  const byMonth = new Map<number, number>();
  for (const item of entregas) {
    byMonth.set(absMonth(item.year, item.month), item.entregasRealizadas);
  }

  const refAbs = referenceStartMonth - 1;
  const amAtual = absMonth(referenceDate.getFullYear(), referenceDate.getMonth() + 1);
  const blockStartAtual = blockStartFor(amAtual, refAbs);
  const blockStartAnterior = blockStartAtual - 3;
  const blockStartProximo = blockStartAtual + 3;

  const metaAtualOverride = overrides?.get(blockKey(blockStartAtual)) ?? null;
  let metaAtual: number | null = metaAtualOverride;
  if (metaAtual === null) {
    const valoresAnteriores = [0, 1, 2].map((i) => byMonth.get(blockStartAnterior + i));
    metaAtual = valoresAnteriores.every((v) => v !== undefined)
      ? Math.round((valoresAnteriores as number[]).reduce((a, b) => a + b, 0) / 3)
      : null;
  }

  const valoresAtuais = [0, 1, 2].map((i) => byMonth.get(blockStartAtual + i));
  const mediaAtual = valoresAtuais.every((v) => v !== undefined)
    ? (valoresAtuais as number[]).reduce((a, b) => a + b, 0) / 3
    : null;
  const proximaMetaSugerida = mediaAtual !== null ? Math.round(mediaAtual) : null;
  const proximaMetaOverride = overrides?.get(blockKey(blockStartProximo)) ?? null;

  return {
    metaAtual,
    blockAtualLabel: blockLabel(blockStartAtual),
    metaAtualOverride,
    proximaMetaSugerida,
    proximaMetaOverride,
    metaProximoTrimestre: proximaMetaOverride ?? proximaMetaSugerida,
    blockProximoLabel: blockLabel(blockStartProximo),
    blockAtualKey: blockKey(blockStartAtual),
    blockProximoKey: blockKey(blockStartProximo),
  };
}

export interface ResultadoLogisticaMensal {
  year: number;
  month: number;
  entregasRealizadas: number;
  meta: number | null;
  /** Resultado final (override manual, se houver; senão o automático). */
  bateuMeta: boolean | null;
  bateuMetaAutomatico: boolean | null;
  bateuMetaManual: boolean | null;
  motoristasAtivos: number;
  ajudantesAtivos: number;
  valorPorMotorista: number;
  valorPorAjudante: number;
  valorTotalPago: number;
}

/**
 * Calcula o resultado mensal completo (meta, se bateu, valor por motorista,
 * valor por ajudante e total pago) para toda a série informada.
 */
export function calcularLogisticaSerie(
  entregas: MonthlyEntregas[],
  config: LogisticaMensalConfig[],
  referenceStartMonth = 1,
  overrides?: Map<string, number>
): ResultadoLogisticaMensal[] {
  const metas = calcularMetasTrimestraisEntregas(entregas, referenceStartMonth, overrides);
  const configPorMes = new Map<string, LogisticaMensalConfig>();
  for (const c of config) {
    configPorMes.set(`${c.year}-${c.month}`, c);
  }

  return entregas
    .slice()
    .sort((a, b) => absMonth(a.year, a.month) - absMonth(b.year, b.month))
    .map((item) => {
      const key = `${item.year}-${item.month}`;
      const meta = metas.get(key) ?? null;
      const bateuMetaAutomatico = meta !== null ? item.entregasRealizadas >= meta : null;
      const cfg = configPorMes.get(key);
      const bateuMetaManual = cfg?.bateuMetaManual ?? null;
      const bateuMeta = bateuMetaManual !== null ? bateuMetaManual : bateuMetaAutomatico ?? false;

      const motoristasAtivos = cfg?.motoristasAtivos ?? 0;
      const ajudantesAtivos = cfg?.ajudantesAtivos ?? 0;
      const variavel = bateuMeta ? item.entregasRealizadas * VALOR_POR_ENTREGA : 0;
      const valorPorMotorista = VALOR_FIXO_MOTORISTA + variavel;
      const valorPorAjudante = VALOR_FIXO_AJUDANTE + variavel;
      const valorTotalPago = valorPorMotorista * motoristasAtivos + valorPorAjudante * ajudantesAtivos;

      return {
        year: item.year,
        month: item.month,
        entregasRealizadas: item.entregasRealizadas,
        meta,
        bateuMeta,
        bateuMetaAutomatico,
        bateuMetaManual,
        motoristasAtivos,
        ajudantesAtivos,
        valorPorMotorista,
        valorPorAjudante,
        valorTotalPago,
      };
    });
}
