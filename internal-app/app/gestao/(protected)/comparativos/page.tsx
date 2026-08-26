'use client';

import { useEffect, useMemo, useState } from 'react';
import ComparativoChart from './ComparativoChart';
import ConstrumixEvolucaoChart from './ConstrumixEvolucaoChart';
import type { MesEvolucao, ResumoAnual, Tendencia } from '@/lib/postgres/construmixEvolucao';
import type { FaturamentoFiscalMensalEmpresa } from '@/lib/postgres/faturamentoFiscalPorEmpresa';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const NOME_EMPRESA: Record<string, string> = {
  construmix: 'Construmix',
  sams: 'SAMS',
  newhouse: 'New House',
};

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (n: number | null) => (n === null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`);
const corVariacao = (n: number | null) => (n === null ? 'var(--muted)' : n > 0 ? '#1baf7a' : n < 0 ? '#c0392b' : 'var(--muted)');

interface RespostaEvolucao {
  serie: MesEvolucao[];
  anos: ResumoAnual[];
  tendencia: Tendencia;
  ranking: { melhores: MesEvolucao[]; piores: MesEvolucao[] };
}

function rotuloMes(m: { year: number; month: number }) {
  return `${MESES[m.month - 1]}/${m.year}`;
}

export default function ComparativosPage() {
  const [dados, setDados] = useState<RespostaEvolucao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mesA, setMesA] = useState<string>('');
  const [mesB, setMesB] = useState<string>('');

  const [fiscal, setFiscal] = useState<FaturamentoFiscalMensalEmpresa[]>([]);
  const [carregandoFiscal, setCarregandoFiscal] = useState(true);
  const anoAtual = new Date().getFullYear();
  const [anoFiscal, setAnoFiscal] = useState(anoAtual);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/comparativos/construmix-evolucao');
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? 'Falha ao carregar.');
        return;
      }
      setDados(data);
      const serie = data.serie as MesEvolucao[];
      if (serie.length >= 2) {
        setMesA(`${serie[serie.length - 2].year}-${serie[serie.length - 2].month}`);
        setMesB(`${serie[serie.length - 1].year}-${serie[serie.length - 1].month}`);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function carregarFiscal(ano: number) {
    setCarregandoFiscal(true);
    try {
      const res = await fetch(`/api/comparativos/faturamento-fiscal?year=${ano}`);
      const data = await res.json();
      if (res.ok) setFiscal(data.resultado);
    } finally {
      setCarregandoFiscal(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    carregarFiscal(anoFiscal);
  }, [anoFiscal]);

  const fiscalSemDados = !carregandoFiscal && fiscal.length > 0 && fiscal.every((r) => r.erro);

  const EMPRESAS = ['construmix', 'sams', 'newhouse'] as const;

  const fiscalPivot = useMemo(() => {
    const porMes = new Map<string, { year: number; month: number; porEmpresa: Record<string, FaturamentoFiscalMensalEmpresa>; totalMes: number }>();
    for (const r of fiscal) {
      const key = `${r.year}-${r.month}`;
      if (!porMes.has(key)) {
        porMes.set(key, { year: r.year, month: r.month, porEmpresa: {}, totalMes: 0 });
      }
      const linha = porMes.get(key)!;
      linha.porEmpresa[r.empresa] = r;
      if (!r.erro) linha.totalMes += r.faturamento ?? 0;
    }
    return Array.from(porMes.values()).sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
  }, [fiscal]);

  const totaisPorEmpresa = useMemo(() => {
    const totais: Record<string, number> = { construmix: 0, sams: 0, newhouse: 0 };
    for (const r of fiscal) {
      if (!r.erro) totais[r.empresa] = (totais[r.empresa] ?? 0) + (r.faturamento ?? 0);
    }
    return totais;
  }, [fiscal]);

  const totalGeral = EMPRESAS.reduce((soma, emp) => soma + totaisPorEmpresa[emp], 0);

  const comparacao = useMemo(() => {
    if (!dados || !mesA || !mesB) return null;
    const a = dados.serie.find((m) => `${m.year}-${m.month}` === mesA);
    const b = dados.serie.find((m) => `${m.year}-${m.month}` === mesB);
    if (!a || !b) return null;

    const diffValor = b.faturamento - a.faturamento;
    const diffPct = a.faturamento > 0 ? (diffValor / a.faturamento) * 100 : null;
    const diffQtd = b.quantidadeVendas - a.quantidadeVendas;
    const diffTicket = b.ticketMedio - a.ticketMedio;
    const destaque = diffPct === null ? 'indisponível' : diffPct > 1 ? 'Crescimento' : diffPct < -1 ? 'Queda' : 'Estabilidade';

    return { a, b, diffValor, diffPct, diffQtd, diffTicket, destaque };
  }, [dados, mesA, mesB]);

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Comparativos</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 680 }}>
        Entre empresas: comparação pelo Faturamento Fiscal. Entre meses: evolução do faturamento de
        pré-venda da Construmix.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18 }}>Comparativo fiscal entre empresas</h2>
        <div className="field" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>Ano</label>
          <select value={anoFiscal} onChange={(e) => setAnoFiscal(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => anoAtual - i).map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
        Soma das notas fiscais com situação &quot;Autorizada&quot;, por mês de emissão.
      </p>

      {carregandoFiscal && <p style={{ color: 'var(--muted)' }}>Carregando…</p>}

      {fiscalSemDados && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p>
            Nenhuma das 3 conexões PostgreSQL está configurada ainda — ver <code>.env.example</code>.
          </p>
        </div>
      )}

      {!carregandoFiscal && fiscal.length > 0 && (
        <>
          <ComparativoChart
            dados={fiscal}
            titulo="Faturamento fiscal por empresa, últimos meses"
            containerId="comparativo-fiscal-chart"
            arquivoPng="comparativo-fiscal-empresas.png"
          />
          <div className="card" style={{ marginBottom: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  {EMPRESAS.map((emp) => (
                    <th key={emp}>{NOME_EMPRESA[emp]}</th>
                  ))}
                  <th>Total do mês</th>
                </tr>
              </thead>
              <tbody>
                {fiscalPivot.map((linha) => (
                  <tr key={`${linha.year}-${linha.month}`}>
                    <td>{MESES[linha.month - 1]}/{linha.year}</td>
                    {EMPRESAS.map((emp) => {
                      const r = linha.porEmpresa[emp];
                      return (
                        <td key={emp}>
                          {!r ? '—' : r.erro ? <span style={{ color: 'var(--muted)' }}>não configurado</span> : brl(r.faturamento ?? 0)}
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: 700 }}>{brl(linha.totalMes)}</td>
                  </tr>
                ))}
              </tbody>
              {fiscalPivot.length > 0 && (
                <tfoot>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Total do período</td>
                    {EMPRESAS.map((emp) => (
                      <td key={emp} style={{ fontWeight: 700 }}>{brl(totaisPorEmpresa[emp])}</td>
                    ))}
                    <td style={{ fontWeight: 700 }}>{brl(totalGeral)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {carregando && <p style={{ color: 'var(--muted)' }}>Carregando…</p>}
      {erro && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p>{erro}</p>
        </div>
      )}

      {dados && dados.serie.length > 0 && (
        <>
          <ConstrumixEvolucaoChart serie={dados.serie} />

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, marginBottom: 4 }}>Tendência</h2>
            <p>{dados.tendencia.mensagem}</p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Comparar dois meses</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="field">
                <label>Mês A</label>
                <select value={mesA} onChange={(e) => setMesA(e.target.value)}>
                  {dados.serie.map((m) => (
                    <option key={`a-${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{rotuloMes(m)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Mês B</label>
                <select value={mesB} onChange={(e) => setMesB(e.target.value)}>
                  {dados.serie.map((m) => (
                    <option key={`b-${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{rotuloMes(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {comparacao && (
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{rotuloMes(comparacao.a)}</th>
                    <th>{rotuloMes(comparacao.b)}</th>
                    <th>Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Faturamento</td>
                    <td>{brl(comparacao.a.faturamento)}</td>
                    <td>{brl(comparacao.b.faturamento)}</td>
                    <td style={{ color: corVariacao(comparacao.diffPct) }}>
                      {brl(comparacao.diffValor)} ({pct(comparacao.diffPct)})
                    </td>
                  </tr>
                  <tr>
                    <td>Quantidade de vendas</td>
                    <td>{comparacao.a.quantidadeVendas}</td>
                    <td>{comparacao.b.quantidadeVendas}</td>
                    <td style={{ color: corVariacao(comparacao.diffQtd) }}>{comparacao.diffQtd >= 0 ? '+' : ''}{comparacao.diffQtd}</td>
                  </tr>
                  <tr>
                    <td>Ticket médio</td>
                    <td>{brl(comparacao.a.ticketMedio)}</td>
                    <td>{brl(comparacao.b.ticketMedio)}</td>
                    <td style={{ color: corVariacao(comparacao.diffTicket) }}>{brl(comparacao.diffTicket)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {comparacao && (
              <p style={{ marginTop: 12, fontWeight: 700 }}>
                Resultado: <span style={{ color: corVariacao(comparacao.diffPct) }}>{comparacao.destaque}</span>
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: 15, marginBottom: 12 }}>Melhores meses</h2>
              <ol style={{ paddingLeft: 18 }}>
                {dados.ranking.melhores.map((m) => (
                  <li key={`melhor-${m.year}-${m.month}`}>{rotuloMes(m)} — {brl(m.faturamento)}</li>
                ))}
                {dados.ranking.melhores.length === 0 && <li style={{ color: 'var(--muted)' }}>Sem dados.</li>}
              </ol>
            </div>
            <div className="card">
              <h2 style={{ fontSize: 15, marginBottom: 12 }}>Piores meses</h2>
              <ol style={{ paddingLeft: 18 }}>
                {dados.ranking.piores.map((m) => (
                  <li key={`pior-${m.year}-${m.month}`}>{rotuloMes(m)} — {brl(m.faturamento)}</li>
                ))}
                {dados.ranking.piores.length === 0 && <li style={{ color: 'var(--muted)' }}>Sem dados.</li>}
              </ol>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Comparativo anual</h2>
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Faturamento total</th>
                  <th>Qtd. vendas</th>
                  <th>Ticket médio</th>
                  <th>Média mensal</th>
                  <th>Melhor mês</th>
                  <th>Pior mês</th>
                  <th>Crescimento anual</th>
                </tr>
              </thead>
              <tbody>
                {dados.anos.map((a) => (
                  <tr key={a.year}>
                    <td>{a.year}</td>
                    <td>{brl(a.faturamentoTotal)}</td>
                    <td>{a.quantidadeVendas}</td>
                    <td>{brl(a.ticketMedio)}</td>
                    <td>{brl(a.mediaMensal)}</td>
                    <td>{rotuloMes(a.melhorMes)}</td>
                    <td>{rotuloMes(a.piorMes)}</td>
                    <td style={{ color: corVariacao(a.crescimentoAnualPct) }}>{pct(a.crescimentoAnualPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
              Anos parciais (com menos de 12 meses na série carregada) não são diretamente comparáveis ao
              total de um ano completo.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Série mensal completa</h2>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Faturamento</th>
                  <th>Qtd. vendas</th>
                  <th>Ticket médio</th>
                  <th>vs. mês anterior</th>
                  <th>vs. mesmo mês ano anterior</th>
                </tr>
              </thead>
              <tbody>
                {[...dados.serie].reverse().map((m) => (
                  <tr key={`${m.year}-${m.month}`}>
                    <td>{rotuloMes(m)}</td>
                    <td>{brl(m.faturamento)}</td>
                    <td>{m.quantidadeVendas}</td>
                    <td>{brl(m.ticketMedio)}</td>
                    <td style={{ color: corVariacao(m.crescimentoMesAnterior) }}>{pct(m.crescimentoMesAnterior)}</td>
                    <td style={{ color: corVariacao(m.crescimentoAnoAnterior) }}>{pct(m.crescimentoAnoAnterior)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
