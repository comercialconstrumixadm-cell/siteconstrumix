'use client';

import { useEffect, useMemo, useState } from 'react';
import ConstrumixEvolucaoChart from './ConstrumixEvolucaoChart';
import type { MesEvolucao, ResumoAnual, Tendencia } from '@/lib/postgres/construmixEvolucao';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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

  useEffect(() => {
    carregar();
  }, []);

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
        Entre empresas: comparação pelo Faturamento Fiscal (aguardando fonte de dados). Entre meses:
        evolução do faturamento de pré-venda da Construmix.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>Comparativo fiscal entre empresas</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Ainda não implementado — depende de identificar a fonte do Faturamento Fiscal mensal no banco do
          Zeus (pendente).
        </p>
      </div>

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
