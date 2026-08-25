import { listAbatimentoDetalhado } from '@/lib/db/abatimento';
import { salvarFaturamentoMensal } from './actions';
import { getFaturamentoFiscalDetalhadoMensal } from '@/lib/postgres/faturamentoFiscalPorEmpresa';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface MesFiscal {
  year: number;
  month: number;
  faturamento?: number;
  quantidadeNotas?: number;
  erro?: string;
}

async function getFaturamentoFiscalRecenteConstrumix(quantidadeMeses = 6): Promise<MesFiscal[]> {
  const hoje = new Date();
  const meses = Array.from({ length: quantidadeMeses }, (_, i) => {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - (quantidadeMeses - 1 - i), 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });

  return Promise.all(
    meses.map(async ({ year, month }): Promise<MesFiscal> => {
      try {
        const detalhe = await getFaturamentoFiscalDetalhadoMensal('construmix', year, month);
        return { year, month, faturamento: detalhe.faturamento, quantidadeNotas: detalhe.quantidadeNotas };
      } catch (error) {
        return { year, month, erro: (error as Error).message };
      }
    })
  );
}

export default async function FaturamentoPage() {
  const abatimentos = listAbatimentoDetalhado();
  const totalFaturamentoBruto = abatimentos.reduce((soma, a) => soma + a.faturamentoPedidos, 0);
  const totalVendasCimento = abatimentos.reduce((soma, a) => soma + a.vendasCimento, 0);
  const totalAbatimento = abatimentos.reduce((soma, a) => soma + a.abatimento, 0);
  const anoAtual = new Date().getFullYear();
  const fiscalRecente = await getFaturamentoFiscalRecenteConstrumix();

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Faturamento</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 680 }}>
        Duas fontes diferentes: <strong>Faturamento Fiscal</strong> (notas fiscais emitidas) e{' '}
        <strong>Faturamento Pré-vendas</strong> (pedidos fechados no balcão, usado no cálculo do
        ABATIMENTO/bonificação).
      </p>

      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Faturamento Fiscal — Construmix</h2>
      <div className="card" style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
          Soma automática das notas fiscais com situação &quot;Autorizada&quot;, por mês de emissão — direto do
          Zeus, sem lançamento manual.
        </p>
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Faturamento fiscal</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {fiscalRecente.map((m) => (
              <tr key={`${m.year}-${m.month}`}>
                <td>{MESES[m.month - 1]}/{m.year}</td>
                <td>{m.erro ? <span style={{ color: 'var(--muted)' }}>não configurado</span> : brl(m.faturamento ?? 0)}</td>
                <td>{m.erro ? '—' : m.quantidadeNotas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Faturamento Pré-vendas (ABATIMENTO)</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 680 }}>
        ABATIMENTO = Faturamento de pedidos do mês (Construmix) − Vendas de cimento do mês. As queries
        reais já existem (ver <code>lib/postgres/construmixFaturamento.ts</code> e{' '}
        <code>lib/postgres/cimentoFilter.ts</code>), mas o lançamento aqui ainda é manual até os números
        serem validados contra a planilha e a sincronização automática ser ligada.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <form action={salvarFaturamentoMensal} className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Lançar mês</h2>
          <div className="field">
            <label>Ano</label>
            <input name="year" type="number" defaultValue={anoAtual} required />
          </div>
          <div className="field">
            <label>Mês</label>
            <select name="month" required defaultValue="">
              <option value="" disabled>Selecione</option>
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Faturamento de pedidos (R$)</label>
            <input name="faturamentoPedidos" type="number" step="0.01" required />
          </div>
          <div className="field">
            <label>Vendas de cimento (R$)</label>
            <input name="vendasCimento" type="number" step="0.01" defaultValue={0} required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
            Salvar
          </button>
        </form>

        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Série mensal</h2>
          <table>
            <thead>
              <tr>
                <th>Ano</th>
                <th>Mês</th>
                <th>Faturamento bruto (pré-venda)</th>
                <th>Abatimento de cimento</th>
                <th>Com abatimento (ABATIMENTO)</th>
              </tr>
            </thead>
            <tbody>
              {abatimentos.map((a) => (
                <tr key={`${a.year}-${a.month}`}>
                  <td>{a.year}</td>
                  <td>{MESES[a.month - 1]}</td>
                  <td>{brl(a.faturamentoPedidos)}</td>
                  <td>−{brl(a.vendasCimento)}</td>
                  <td style={{ fontWeight: 700 }}>{brl(a.abatimento)}</td>
                </tr>
              ))}
              {abatimentos.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--muted)' }}>Nenhum mês lançado ainda.</td>
                </tr>
              )}
            </tbody>
            {abatimentos.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ fontWeight: 700 }}>Total ({abatimentos.length} {abatimentos.length === 1 ? 'mês' : 'meses'})</td>
                  <td style={{ fontWeight: 700 }}>{brl(totalFaturamentoBruto)}</td>
                  <td style={{ fontWeight: 700 }}>−{brl(totalVendasCimento)}</td>
                  <td style={{ fontWeight: 700 }}>{brl(totalAbatimento)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
