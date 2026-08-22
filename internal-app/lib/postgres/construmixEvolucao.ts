import { getFaturamentoDetalhadoMensalPorEmpresa } from './faturamentoPorEmpresa';

export interface MesEvolucao {
  year: number;
  month: number;
  faturamento: number;
  quantidadeVendas: number;
  ticketMedio: number;
  crescimentoMesAnterior: number | null;
  crescimentoAnoAnterior: number | null;
}

export interface ResumoAnual {
  year: number;
  faturamentoTotal: number;
  quantidadeVendas: number;
  ticketMedio: number;
  mediaMensal: number;
  melhorMes: MesEvolucao;
  piorMes: MesEvolucao;
  crescimentoAnualPct: number | null;
}

export interface Tendencia {
  direcao: 'crescimento' | 'queda' | 'estavel' | 'indisponivel';
  mensagem: string;
}

function gerarMeses(quantidade: number, referencia = new Date()): { year: number; month: number }[] {
  const meses: { year: number; month: number }[] = [];
  const cursor = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), 1));
  for (let i = 0; i < quantidade; i++) {
    meses.unshift({ year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1 });
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
  }
  return meses;
}

function variacaoPercentual(atual: number, anterior: number): number | null {
  if (!anterior) return null;
  return ((atual - anterior) / anterior) * 100;
}

/**
 * Evolução mensal do faturamento de pedidos (pré-venda) da Construmix.
 * Busca 12 meses a mais do que o pedido só pra sempre conseguir calcular a
 * variação contra "o mesmo mês do ano anterior" mesmo no primeiro mês
 * visível da série.
 *
 * PENDENTE (mesma ressalva de construmixFaturamento.ts): ainda não exclui
 * cancelamentos/devoluções — validar contra a planilha antes de usar em
 * decisão de negócio.
 */
export async function getEvolucaoMensalConstrumix(quantidadeMeses = 24): Promise<MesEvolucao[]> {
  const mesesBusca = gerarMeses(quantidadeMeses + 12);

  const detalhes = await Promise.all(
    mesesBusca.map(async ({ year, month }) => ({
      year,
      month,
      ...(await getFaturamentoDetalhadoMensalPorEmpresa('construmix', year, month)),
    }))
  );

  const porChave = new Map(detalhes.map((d) => [`${d.year}-${d.month}`, d]));

  const serieCompleta: MesEvolucao[] = detalhes.map((atual, i) => {
    const mesAnterior = i > 0 ? detalhes[i - 1] : undefined;
    const mesAnoAnterior = porChave.get(`${atual.year - 1}-${atual.month}`);
    return {
      year: atual.year,
      month: atual.month,
      faturamento: atual.faturamento,
      quantidadeVendas: atual.quantidadeVendas,
      ticketMedio: atual.quantidadeVendas > 0 ? atual.faturamento / atual.quantidadeVendas : 0,
      crescimentoMesAnterior: mesAnterior ? variacaoPercentual(atual.faturamento, mesAnterior.faturamento) : null,
      crescimentoAnoAnterior: mesAnoAnterior ? variacaoPercentual(atual.faturamento, mesAnoAnterior.faturamento) : null,
    };
  });

  return serieCompleta.slice(-quantidadeMeses);
}

export function rankingMeses(serie: MesEvolucao[], quantidade = 3) {
  const semDados = serie.filter((m) => m.faturamento > 0);
  const ordenadoDesc = [...semDados].sort((a, b) => b.faturamento - a.faturamento);
  return {
    melhores: ordenadoDesc.slice(0, quantidade),
    piores: [...ordenadoDesc].reverse().slice(0, quantidade),
  };
}

/** Detecta sequência de meses consecutivos em crescimento ou queda, contando a partir do mês mais recente. */
export function analisarTendencia(serie: MesEvolucao[]): Tendencia {
  const validos = serie.filter((m) => m.crescimentoMesAnterior !== null);
  if (validos.length === 0) {
    return { direcao: 'indisponivel', mensagem: 'Dados insuficientes para analisar tendência.' };
  }

  let streak = 0;
  let direcao: 'crescimento' | 'queda' | null = null;
  for (let i = validos.length - 1; i >= 0; i--) {
    const variacao = validos[i].crescimentoMesAnterior as number;
    const dir = variacao > 0 ? 'crescimento' : variacao < 0 ? 'queda' : null;
    if (direcao === null) {
      if (dir === null) break;
      direcao = dir;
      streak = 1;
    } else if (dir === direcao) {
      streak++;
    } else {
      break;
    }
  }

  if (!direcao || streak <= 1) {
    return { direcao: 'estavel', mensagem: 'Faturamento sem tendência clara de alta ou queda nos últimos meses.' };
  }
  return {
    direcao,
    mensagem: `Faturamento apresentou ${direcao} durante ${streak} meses consecutivos.`,
  };
}

export function comparativoAnual(serie: MesEvolucao[]): ResumoAnual[] {
  const porAno = new Map<number, MesEvolucao[]>();
  for (const m of serie) {
    if (!porAno.has(m.year)) porAno.set(m.year, []);
    porAno.get(m.year)!.push(m);
  }

  const anos = [...porAno.keys()].sort((a, b) => a - b);
  const resumos: ResumoAnual[] = anos.map((year) => {
    const meses = porAno.get(year)!;
    const faturamentoTotal = meses.reduce((soma, m) => soma + m.faturamento, 0);
    const quantidadeVendas = meses.reduce((soma, m) => soma + m.quantidadeVendas, 0);
    return {
      year,
      faturamentoTotal,
      quantidadeVendas,
      ticketMedio: quantidadeVendas > 0 ? faturamentoTotal / quantidadeVendas : 0,
      mediaMensal: faturamentoTotal / meses.length,
      melhorMes: meses.reduce((a, b) => (b.faturamento > a.faturamento ? b : a)),
      piorMes: meses.reduce((a, b) => (b.faturamento < a.faturamento ? b : a)),
      crescimentoAnualPct: null,
    };
  });

  for (let i = 1; i < resumos.length; i++) {
    resumos[i].crescimentoAnualPct = variacaoPercentual(resumos[i].faturamentoTotal, resumos[i - 1].faturamentoTotal);
  }

  return resumos;
}
