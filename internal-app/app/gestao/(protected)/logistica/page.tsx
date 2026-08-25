import { listLogisticaPessoas } from '@/lib/db/logisticaPessoas';
import { listLogisticaMensal } from '@/lib/db/logisticaMensal';
import {
  adicionarLogisticaPessoa,
  alternarLogisticaPessoaAtiva,
  apagarLogisticaPessoa,
  salvarLogisticaMensal,
} from './actions';
import LogisticaPainel from './LogisticaPainel';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function LogisticaPage() {
  const pessoas = listLogisticaPessoas();
  const meses = listLogisticaMensal();
  const anoAtual = new Date().getFullYear();

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Bonificação de logística</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 680 }}>
        Meta trimestral de entregas (mesmo alinhamento Dez-Jan-Fev da bonificação de vendas) +
        valor fixo por pessoa + R$0,50 por entrega realizada no mês, só se a meta do trimestre foi
        batida. Motoristas: R$110,00 fixo. Ajudantes: R$82,50 fixo.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, marginBottom: 32 }}>
        <form action={salvarLogisticaMensal} className="card">
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
            <label>Entregas realizadas</label>
            <input name="entregasRealizadas" type="number" min={0} required />
          </div>
          <div className="field">
            <label>Nº de motoristas ativos</label>
            <input name="motoristasAtivos" type="number" min={0} required />
          </div>
          <div className="field">
            <label>Nº de ajudantes ativos</label>
            <input name="ajudantesAtivos" type="number" min={0} required />
          </div>
          <div className="field">
            <label>Bateu a meta do trimestre?</label>
            <select name="bateuMetaManual" defaultValue="auto">
              <option value="auto">Automático (compara com a meta)</option>
              <option value="sim">Sim (forçar)</option>
              <option value="nao">Não (forçar)</option>
            </select>
          </div>
          <div className="field">
            <label>Observação (opcional)</label>
            <input name="observacao" type="text" placeholder="ex: motorista de férias em julho" />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
            Salvar
          </button>
        </form>

        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Meses lançados</h2>
          <table>
            <thead>
              <tr>
                <th>Ano</th>
                <th>Mês</th>
                <th>Entregas</th>
                <th>Motoristas</th>
                <th>Ajudantes</th>
                <th>Bateu meta?</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => (
                <tr key={`${m.year}-${m.month}`}>
                  <td>{m.year}</td>
                  <td>{MESES[m.month - 1]}</td>
                  <td>{m.entregasRealizadas}</td>
                  <td>{m.motoristasAtivos}</td>
                  <td>{m.ajudantesAtivos}</td>
                  <td>{m.bateuMetaManual === null ? 'automático' : m.bateuMetaManual ? 'sim (forçado)' : 'não (forçado)'}</td>
                </tr>
              ))}
              {meses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--muted)' }}>Nenhum mês lançado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Motoristas e ajudantes</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 16, maxWidth: 680 }}>
          Usado só pra emitir os recibos nominais — sempre reflete &quot;quem está ativo agora&quot;, não
          tem histórico por mês. Confira se bate com os números lançados acima antes de gerar recibos
          de um mês passado.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          <form action={adicionarLogisticaPessoa} className="card">
            <div className="field">
              <label>Nome</label>
              <input name="nome" type="text" required />
            </div>
            <div className="field">
              <label>Função</label>
              <select name="papel" required defaultValue="">
                <option value="" disabled>Selecione</option>
                <option value="motorista">Motorista</option>
                <option value="ajudante">Ajudante</option>
              </select>
            </div>
            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              Adicionar
            </button>
          </form>

          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Função</th>
                  <th>Ativo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.papel === 'motorista' ? 'Motorista' : 'Ajudante'}</td>
                    <td>
                      <form action={alternarLogisticaPessoaAtiva}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="ativo" value={p.ativo ? '0' : '1'} />
                        <button type="submit" className="btn btn-secondary">
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form action={apagarLogisticaPessoa}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="btn btn-secondary">Remover</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {pessoas.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: 'var(--muted)' }}>Nenhum motorista/ajudante cadastrado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LogisticaPainel />
    </div>
  );
}
