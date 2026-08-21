import { listAbatimentoMensal } from '@/lib/db/abatimento';
import { salvarFaturamentoMensal } from './actions';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function FaturamentoPage() {
  const abatimentos = listAbatimentoMensal();
  const anoAtual = new Date().getFullYear();

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Faturamento (ABATIMENTO)</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
        ABATIMENTO = Faturamento de pedidos do mês (Construmix) − Vendas de cimento do mês.
        As queries reais já existem (ver <code>lib/postgres/construmixFaturamento.ts</code> e{' '}
        <code>lib/postgres/cimentoFilter.ts</code>), mas o lançamento aqui ainda é manual até os
        números serem validados contra a planilha e a sincronização automática ser ligada.
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
                <th>ABATIMENTO</th>
              </tr>
            </thead>
            <tbody>
              {abatimentos.map((a) => (
                <tr key={`${a.year}-${a.month}`}>
                  <td>{a.year}</td>
                  <td>{MESES[a.month - 1]}</td>
                  <td>{a.abatimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
              {abatimentos.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: 'var(--muted)' }}>Nenhum mês lançado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
