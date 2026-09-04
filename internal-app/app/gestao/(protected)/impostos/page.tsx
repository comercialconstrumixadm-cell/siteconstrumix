'use client';

import { useEffect, useState } from 'react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface MesSimplesNacional {
  year: number;
  month: number;
  receitaMes: number;
  rbt12: number;
  aliquotaNominal: number | null;
  aliquotaEfetiva: number;
  valorDevido: number;
  foraDoLimite: boolean;
}

interface MesPisCofins {
  year: number;
  month: number;
  receitaMes: number;
  pis: number;
  cofins: number;
  total: number;
}

interface TrimestreLucroPresumido {
  year: number;
  trimestre: number;
  meses: number[];
  completo: boolean;
  receitaTrimestre: number;
  irpjNormal: number;
  irpjAdicional: number;
  irpjTotal: number;
  csll: number;
  totalTrimestre: number;
}

interface RespostaImpostos {
  construmix: { meses: MesSimplesNacional[]; erro?: string };
  newhouse: { meses: MesSimplesNacional[]; erro?: string };
  sams: { pisCofinsMensal: MesPisCofins[]; irpjCsllTrimestral: TrimestreLucroPresumido[]; erro?: string };
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

function TabelaSimplesNacional({ titulo, dados }: { titulo: string; dados: { meses: MesSimplesNacional[]; erro?: string } }) {
  const total = dados.meses.reduce((soma, m) => soma + m.valorDevido, 0);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, marginBottom: 12 }}>{titulo}</h2>
      {dados.erro && <p style={{ color: 'var(--muted)' }}>Não configurado: {dados.erro}</p>}
      {!dados.erro && (
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Receita do mês</th>
              <th>RBT12</th>
              <th>Alíquota nominal</th>
              <th>Alíquota efetiva</th>
              <th>DAS estimado</th>
            </tr>
          </thead>
          <tbody>
            {dados.meses.map((m) => (
              <tr key={`${m.year}-${m.month}`}>
                <td>{MESES[m.month - 1]}/{m.year}</td>
                <td>{brl(m.receitaMes)}</td>
                <td>{brl(m.rbt12)}</td>
                <td>{m.foraDoLimite ? '—' : m.aliquotaNominal !== null ? pct(m.aliquotaNominal) : '—'}</td>
                <td>{m.foraDoLimite ? '—' : pct(m.aliquotaEfetiva)}</td>
                <td style={{ fontWeight: 700 }}>
                  {m.foraDoLimite ? (
                    <span style={{ color: '#c0392b' }}>RBT12 acima do teto do Simples</span>
                  ) : (
                    brl(m.valorDevido)
                  )}
                </td>
              </tr>
            ))}
            {dados.meses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)' }}>Sem dados no período selecionado.</td>
              </tr>
            )}
          </tbody>
          {dados.meses.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} style={{ fontWeight: 700 }}>Total estimado do período</td>
                <td style={{ fontWeight: 700 }}>{brl(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

export default function ImpostosPage() {
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [dados, setDados] = useState<RespostaImpostos | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar(anoSelecionado: number) {
    setCarregando(true);
    try {
      const res = await fetch(`/api/impostos?year=${anoSelecionado}`);
      const data = await res.json();
      if (res.ok) setDados(data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar(ano);
  }, [ano]);

  const totalPisCofins = dados?.sams.pisCofinsMensal.reduce((soma, m) => soma + m.total, 0) ?? 0;
  const totalIrpjCsll = dados?.sams.irpjCsllTrimestral.reduce((soma, t) => soma + t.totalTrimestre, 0) ?? 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1>Impostos</h1>
        <div className="field" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>Ano</label>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => anoAtual - i).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 8,
          background: '#fff8e1',
          border: '1px solid #f0d78c',
          fontSize: 13,
          marginBottom: 24,
          maxWidth: 780,
        }}
      >
        <strong>Isso é uma estimativa de planejamento, não a apuração oficial.</strong> Serve pra saber
        quanto separar de caixa, não substitui o PGDAS-D do Simples Nacional nem a apuração formal da
        SAMS pelo contador — tabelas e alíquotas mudam por lei, confira com o contador antes de usar
        pra decidir pagamento real. A base de cálculo é o Faturamento Fiscal (notas &quot;Autorizada&quot;)
        já usado no resto do app. ICMS não entra na conta da SAMS — depende de substituição tributária
        e regras estaduais específicas, difícil estimar com segurança aqui.
      </div>

      {carregando && <p style={{ color: 'var(--muted)' }}>Carregando…</p>}

      {dados && (
        <>
          <TabelaSimplesNacional titulo="Simples Nacional — Construmix (Anexo I, Comércio)" dados={dados.construmix} />
          <TabelaSimplesNacional titulo="Simples Nacional — New House (Anexo I, Comércio)" dados={dados.newhouse} />

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, marginBottom: 4 }}>Lucro Presumido — SAMS</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
              PIS e COFINS são apurados mensalmente. IRPJ e CSLL são apurados por trimestre civil
              (Jan-Mar/Abr-Jun/Jul-Set/Out-Dez) — são as &quot;guias do trimestre&quot;.
            </p>

            {dados.sams.erro && <p style={{ color: 'var(--muted)' }}>Não configurado: {dados.sams.erro}</p>}

            {!dados.sams.erro && (
              <>
                <h3 style={{ fontSize: 13, marginBottom: 8 }}>PIS/COFINS (mensal)</h3>
                <table style={{ marginBottom: 20 }}>
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Receita do mês</th>
                      <th>PIS (0,65%)</th>
                      <th>COFINS (3%)</th>
                      <th>Total do mês</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.sams.pisCofinsMensal.map((m) => (
                      <tr key={`${m.year}-${m.month}`}>
                        <td>{MESES[m.month - 1]}/{m.year}</td>
                        <td>{brl(m.receitaMes)}</td>
                        <td>{brl(m.pis)}</td>
                        <td>{brl(m.cofins)}</td>
                        <td style={{ fontWeight: 700 }}>{brl(m.total)}</td>
                      </tr>
                    ))}
                    {dados.sams.pisCofinsMensal.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ color: 'var(--muted)' }}>Sem dados no período selecionado.</td>
                      </tr>
                    )}
                  </tbody>
                  {dados.sams.pisCofinsMensal.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ fontWeight: 700 }}>Total estimado do período</td>
                        <td style={{ fontWeight: 700 }}>{brl(totalPisCofins)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                <h3 style={{ fontSize: 13, marginBottom: 8 }}>IRPJ/CSLL (trimestral)</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Trimestre</th>
                      <th>Receita do trimestre</th>
                      <th>IRPJ (normal + adicional)</th>
                      <th>CSLL</th>
                      <th>Total do trimestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.sams.irpjCsllTrimestral.map((t) => (
                      <tr key={`${t.year}-${t.trimestre}`}>
                        <td>
                          {t.trimestre}º trim/{t.year} ({t.meses.map((m) => MESES[m - 1].slice(0, 3)).join('-')})
                          {!t.completo && <div style={{ fontSize: 11, color: 'var(--muted)' }}>trimestre em andamento</div>}
                        </td>
                        <td>{brl(t.receitaTrimestre)}</td>
                        <td>{brl(t.irpjTotal)} {t.irpjAdicional > 0 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>(inclui adicional)</span>}</td>
                        <td>{brl(t.csll)}</td>
                        <td style={{ fontWeight: 700 }}>{brl(t.totalTrimestre)}</td>
                      </tr>
                    ))}
                    {dados.sams.irpjCsllTrimestral.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ color: 'var(--muted)' }}>Sem dados no período selecionado.</td>
                      </tr>
                    )}
                  </tbody>
                  {dados.sams.irpjCsllTrimestral.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ fontWeight: 700 }}>Total estimado do período</td>
                        <td style={{ fontWeight: 700 }}>{brl(totalIrpjCsll)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
