import type { Empresa } from './config';
import { getFaturamentoFiscalDetalhadoMensal } from './faturamentoFiscalPorEmpresa';
import {
  calcularLucroPresumidoTrimestral,
  calcularPisCofinsMensal,
  calcularSimplesNacional,
  trimestreCivil,
} from '../impostos';

function absMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function fromAbsMonth(abs: number): { year: number; month: number } {
  return { year: Math.floor(abs / 12), month: (abs % 12) + 1 };
}

async function receitaFiscalMensal(empresa: Empresa, year: number, month: number): Promise<number> {
  const detalhe = await getFaturamentoFiscalDetalhadoMensal(empresa, year, month);
  return detalhe.faturamento;
}

export interface MesSimplesNacional {
  year: number;
  month: number;
  receitaMes: number;
  /** Receita bruta dos 12 meses ANTERIORES a este (não inclui o próprio mês). */
  rbt12: number;
  aliquotaNominal: number | null;
  aliquotaEfetiva: number;
  valorDevido: number;
  foraDoLimite: boolean;
}

/**
 * DAS estimado mês a mês (Simples Nacional, Anexo I). Busca 12 meses a mais
 * antes do primeiro mês pedido, só pra poder calcular o RBT12 dele.
 */
export async function getSimplesNacionalMensal(
  empresa: Empresa,
  mesesExibir: { year: number; month: number }[]
): Promise<{ meses: MesSimplesNacional[]; erro?: string }> {
  if (mesesExibir.length === 0) return { meses: [] };

  const absExibir = mesesExibir.map((m) => absMonth(m.year, m.month));
  const primeiroAbs = Math.min(...absExibir);
  const ultimoAbs = Math.max(...absExibir);

  const todosAbs: number[] = [];
  for (let a = primeiroAbs - 12; a <= ultimoAbs; a++) todosAbs.push(a);

  try {
    const receitas = new Map<number, number>();
    await Promise.all(
      todosAbs.map(async (abs) => {
        const { year, month } = fromAbsMonth(abs);
        receitas.set(abs, await receitaFiscalMensal(empresa, year, month));
      })
    );

    const meses = mesesExibir.map(({ year, month }) => {
      const abs = absMonth(year, month);
      const receitaMes = receitas.get(abs) ?? 0;
      let rbt12 = 0;
      for (let i = 1; i <= 12; i++) rbt12 += receitas.get(abs - i) ?? 0;

      const resultado = calcularSimplesNacional(rbt12, receitaMes);
      return {
        year,
        month,
        receitaMes,
        rbt12,
        aliquotaNominal: resultado.faixa?.aliquotaNominal ?? null,
        aliquotaEfetiva: resultado.aliquotaEfetiva,
        valorDevido: resultado.valorDevido,
        foraDoLimite: resultado.foraDoLimite,
      };
    });

    return { meses };
  } catch (error) {
    return { meses: [], erro: (error as Error).message };
  }
}

export interface MesPisCofins {
  year: number;
  month: number;
  receitaMes: number;
  pis: number;
  cofins: number;
  total: number;
}

export interface TrimestreLucroPresumido {
  year: number;
  /** 1-4 (trimestre civil: Jan-Mar, Abr-Jun, Jul-Set, Out-Dez). */
  trimestre: number;
  meses: number[];
  /** false se o trimestre ainda não tem os 3 meses completos no período pedido (ex: trimestre em andamento). */
  completo: boolean;
  receitaTrimestre: number;
  irpjNormal: number;
  irpjAdicional: number;
  irpjTotal: number;
  csll: number;
  totalTrimestre: number;
}

/**
 * SAMS (Lucro Presumido, comércio): PIS/COFINS mês a mês + IRPJ/CSLL por
 * trimestre civil. ICMS fica de fora (ver nota em lib/impostos.ts).
 */
export async function getLucroPresumidoSams(
  mesesExibir: { year: number; month: number }[]
): Promise<{ pisCofinsMensal: MesPisCofins[]; irpjCsllTrimestral: TrimestreLucroPresumido[]; erro?: string }> {
  if (mesesExibir.length === 0) return { pisCofinsMensal: [], irpjCsllTrimestral: [] };

  try {
    const receitas = await Promise.all(
      mesesExibir.map(async ({ year, month }) => ({ year, month, receita: await receitaFiscalMensal('sams', year, month) }))
    );

    const pisCofinsMensal: MesPisCofins[] = receitas.map(({ year, month, receita }) => {
      const r = calcularPisCofinsMensal(receita);
      return { year, month, receitaMes: receita, pis: r.pis, cofins: r.cofins, total: r.total };
    });

    const porTrimestre = new Map<string, { year: number; trimestre: number; meses: number[]; receita: number }>();
    for (const { year, month, receita } of receitas) {
      const trimestre = trimestreCivil(month);
      const key = `${year}-${trimestre}`;
      if (!porTrimestre.has(key)) porTrimestre.set(key, { year, trimestre, meses: [], receita: 0 });
      const grupo = porTrimestre.get(key)!;
      grupo.meses.push(month);
      grupo.receita += receita;
    }

    const irpjCsllTrimestral: TrimestreLucroPresumido[] = Array.from(porTrimestre.values())
      .sort((a, b) => a.year * 4 + a.trimestre - (b.year * 4 + b.trimestre))
      .map((grupo) => {
        const resultado = calcularLucroPresumidoTrimestral(grupo.receita);
        return {
          year: grupo.year,
          trimestre: grupo.trimestre,
          meses: grupo.meses.slice().sort((a, b) => a - b),
          completo: grupo.meses.length === 3,
          receitaTrimestre: grupo.receita,
          irpjNormal: resultado.irpjNormal,
          irpjAdicional: resultado.irpjAdicional,
          irpjTotal: resultado.irpjTotal,
          csll: resultado.csll,
          totalTrimestre: resultado.totalTrimestre,
        };
      });

    return { pisCofinsMensal, irpjCsllTrimestral };
  } catch (error) {
    return { pisCofinsMensal: [], irpjCsllTrimestral: [], erro: (error as Error).message };
  }
}
