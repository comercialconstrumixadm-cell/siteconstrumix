/**
 * Estimativa de impostos — Construmix e New House (Simples Nacional, Anexo
 * I - Comércio) e SAMS (Lucro Presumido, comércio).
 *
 * IMPORTANTE: isso é uma ferramenta de PLANEJAMENTO (quanto separar de
 * caixa), não substitui o PGDAS-D oficial do Simples Nacional nem a
 * apuração formal da SAMS pelo contador. Tabelas e alíquotas de impostos
 * mudam por lei — confirmar com o contador antes de usar pra decidir
 * pagamento real. Regras fechadas com o Marcos em 2026-08:
 * - Construmix e New House: Simples Nacional, Anexo I (Comércio).
 * - SAMS: Lucro Presumido (comércio) — IRPJ/CSLL apurados por trimestre
 *   civil (Jan-Mar/Abr-Jun/Jul-Set/Out-Dez, nunca confundir com o
 *   trimestre Dez-Jan-Fev usado na bonificação — são coisas diferentes);
 *   PIS/COFINS apurados mensalmente (regime cumulativo, comum no Lucro
 *   Presumido). ICMS não entra aqui — depende de substituição tributária
 *   e regras estaduais específicas de Sergipe, difícil estimar com
 *   segurança sem mais detalhe; fica de fora até validar isso.
 *
 * Base de cálculo (receita bruta) usada em tudo: o Faturamento Fiscal já
 * calculado no resto do app (soma das notas fiscais "Autorizada" por mês
 * de emissão — ver lib/postgres/faturamentoFiscalPorEmpresa.ts).
 */

// --- Simples Nacional, Anexo I (Comércio) ---
// Tabela vigente desde a reforma da LC 155/2016 (jan/2018), sem mudança de
// valores desde então até onde sei — mas SEMPRE conferir a tabela vigente
// (Receita Federal / Portal do Simples Nacional) antes de confiar no valor.
export interface FaixaSimplesNacional {
  /** Limite superior da faixa (RBT12), em R$. */
  ate: number;
  /** Alíquota nominal da faixa. */
  aliquotaNominal: number;
  /** Parcela a deduzir da faixa, em R$. */
  parcelaDeduzir: number;
}

export const FAIXAS_SIMPLES_ANEXO_I: FaixaSimplesNacional[] = [
  { ate: 180_000, aliquotaNominal: 0.04, parcelaDeduzir: 0 },
  { ate: 360_000, aliquotaNominal: 0.073, parcelaDeduzir: 5_940 },
  { ate: 720_000, aliquotaNominal: 0.095, parcelaDeduzir: 13_860 },
  { ate: 1_800_000, aliquotaNominal: 0.107, parcelaDeduzir: 22_500 },
  { ate: 3_600_000, aliquotaNominal: 0.143, parcelaDeduzir: 87_300 },
  { ate: 4_800_000, aliquotaNominal: 0.19, parcelaDeduzir: 378_000 },
];

export interface ResultadoSimplesNacional {
  /** Receita bruta acumulada dos 12 meses ANTERIORES ao mês de apuração (não inclui o mês corrente). */
  rbt12: number;
  /** Receita bruta do próprio mês (base sobre a qual o DAS é calculado). */
  receitaMes: number;
  /** true se RBT12 passou do teto do Simples (R$4.800.000) — fora do regime, cálculo não se aplica. */
  foraDoLimite: boolean;
  faixa: FaixaSimplesNacional | null;
  aliquotaEfetiva: number;
  /** Valor estimado do DAS do mês. */
  valorDevido: number;
}

/**
 * Fórmula oficial do Simples Nacional (LC 123/2006, Art. 18): alíquota
 * efetiva = [(RBT12 x alíquota nominal da faixa) - parcela a deduzir] / RBT12,
 * aplicada sobre a receita bruta do PRÓPRIO MÊS (não sobre o RBT12).
 */
export function calcularSimplesNacional(rbt12: number, receitaMes: number): ResultadoSimplesNacional {
  const tetoSimples = FAIXAS_SIMPLES_ANEXO_I[FAIXAS_SIMPLES_ANEXO_I.length - 1].ate;
  if (rbt12 > tetoSimples) {
    return { rbt12, receitaMes, foraDoLimite: true, faixa: null, aliquotaEfetiva: 0, valorDevido: 0 };
  }

  const faixa = FAIXAS_SIMPLES_ANEXO_I.find((f) => rbt12 <= f.ate) ?? FAIXAS_SIMPLES_ANEXO_I[0];
  const aliquotaEfetiva = rbt12 > 0 ? (rbt12 * faixa.aliquotaNominal - faixa.parcelaDeduzir) / rbt12 : 0;
  const valorDevido = Math.max(0, aliquotaEfetiva) * receitaMes;

  return { rbt12, receitaMes, foraDoLimite: false, faixa, aliquotaEfetiva: Math.max(0, aliquotaEfetiva), valorDevido };
}

// --- Lucro Presumido (SAMS, comércio) ---
const PRESUNCAO_IRPJ_COMERCIO = 0.08;
const PRESUNCAO_CSLL_COMERCIO = 0.12;
const ALIQUOTA_IRPJ = 0.15;
const ALIQUOTA_ADICIONAL_IRPJ = 0.1;
/** R$20.000/mês de limite pro adicional de IRPJ, x3 meses do trimestre. */
const LIMITE_ADICIONAL_IRPJ_TRIMESTRAL = 60_000;
const ALIQUOTA_CSLL = 0.09;
const ALIQUOTA_PIS_CUMULATIVO = 0.0065;
const ALIQUOTA_COFINS_CUMULATIVO = 0.03;

export interface ResultadoLucroPresumidoTrimestral {
  receitaTrimestre: number;
  baseIrpj: number;
  irpjNormal: number;
  irpjAdicional: number;
  irpjTotal: number;
  baseCsll: number;
  csll: number;
  totalTrimestre: number;
}

/** IRPJ + CSLL trimestrais (comércio), Lucro Presumido. */
export function calcularLucroPresumidoTrimestral(receitaTrimestre: number): ResultadoLucroPresumidoTrimestral {
  const baseIrpj = receitaTrimestre * PRESUNCAO_IRPJ_COMERCIO;
  const irpjNormal = baseIrpj * ALIQUOTA_IRPJ;
  const excedente = Math.max(0, baseIrpj - LIMITE_ADICIONAL_IRPJ_TRIMESTRAL);
  const irpjAdicional = excedente * ALIQUOTA_ADICIONAL_IRPJ;
  const irpjTotal = irpjNormal + irpjAdicional;

  const baseCsll = receitaTrimestre * PRESUNCAO_CSLL_COMERCIO;
  const csll = baseCsll * ALIQUOTA_CSLL;

  return { receitaTrimestre, baseIrpj, irpjNormal, irpjAdicional, irpjTotal, baseCsll, csll, totalTrimestre: irpjTotal + csll };
}

export interface ResultadoPisCofinsMensal {
  receitaMes: number;
  pis: number;
  cofins: number;
  total: number;
}

/** PIS + COFINS mensais (regime cumulativo), Lucro Presumido. */
export function calcularPisCofinsMensal(receitaMes: number): ResultadoPisCofinsMensal {
  const pis = receitaMes * ALIQUOTA_PIS_CUMULATIVO;
  const cofins = receitaMes * ALIQUOTA_COFINS_CUMULATIVO;
  return { receitaMes, pis, cofins, total: pis + cofins };
}

/** Trimestre civil (Jan-Mar/Abr-Jun/Jul-Set/Out-Dez) de um mês — não confundir com o trimestre Dez-Jan-Fev da bonificação. */
export function trimestreCivil(month: number): number {
  return Math.ceil(month / 3);
}
