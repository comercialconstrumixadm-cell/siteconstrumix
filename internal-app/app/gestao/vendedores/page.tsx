import { listVendedoresAtivos } from '@/lib/db/vendedores';
import { salvarVendedoresAtivos } from './actions';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function VendedoresPage() {
  const vendedores = listVendedoresAtivos();
  const anoAtual = new Date().getFullYear();

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Vendedores ativos por mês</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
        Número de vendedores que dividem o bônus naquele mês específico (férias,
        desligamentos e contratações mudam quem entra na divisão). A Cris (administrativo)
        não entra nesta contagem — ela recebe 50% do valor calculado por vendedor.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <form action={salvarVendedoresAtivos} className="card">
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
            <label>Nº de vendedores ativos</label>
            <input name="vendedoresAtivos" type="number" min={0} required />
          </div>
          <div className="field">
            <label>Observação (opcional)</label>
            <input name="observacao" type="text" placeholder="ex: saída da Fulana em 15/04" />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
            Salvar
          </button>
        </form>

        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Configuração por mês</h2>
          <table>
            <thead>
              <tr>
                <th>Ano</th>
                <th>Mês</th>
                <th>Vendedores</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v: any) => (
                <tr key={`${v.year}-${v.month}`}>
                  <td>{v.year}</td>
                  <td>{MESES[v.month - 1]}</td>
                  <td>{v.vendedoresAtivos}</td>
                  <td>{v.observacao ?? '—'}</td>
                </tr>
              ))}
              {vendedores.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--muted)' }}>Nenhum mês configurado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
