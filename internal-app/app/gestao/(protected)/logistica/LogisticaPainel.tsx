'use client';

import { useEffect, useState } from 'react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface LogisticaPessoa {
  id: number;
  nome: string;
  papel: 'motorista' | 'ajudante';
  ativo: boolean;
}

interface ResultadoLogisticaMensal {
  year: number;
  month: number;
  entregasRealizadas: number;
  meta: number | null;
  bateuMeta: boolean | null;
  motoristasAtivos: number;
  ajudantesAtivos: number;
  valorPorMotorista: number;
  valorPorAjudante: number;
  valorTotalPago: number;
}

interface MetaVigenteEntregasInfo {
  metaAtual: number | null;
  blockAtualLabel: string;
  metaAtualOverride: number | null;
  proximaMetaSugerida: number | null;
  proximaMetaOverride: number | null;
  metaProximoTrimestre: number | null;
  blockProximoLabel: string;
  blockAtualKey: string;
  blockProximoKey: string;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function LogisticaPainel() {
  const [resultado, setResultado] = useState<ResultadoLogisticaMensal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [pessoas, setPessoas] = useState<LogisticaPessoa[]>([]);
  const [gerandoRecibo, setGerandoRecibo] = useState<string | null>(null);
  const [meta, setMeta] = useState<MetaVigenteEntregasInfo | null>(null);
  const [metaAtualInput, setMetaAtualInput] = useState('');
  const [metaProximaInput, setMetaProximaInput] = useState('');
  const [salvandoMeta, setSalvandoMeta] = useState<'atual' | 'proxima' | null>(null);

  async function calcular() {
    setCarregando(true);
    try {
      const res = await fetch('/api/logistica/calcular', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setResultado(data.resultado);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarPessoas() {
    const res = await fetch('/api/logistica/pessoas');
    const data = await res.json();
    if (res.ok) setPessoas(data.pessoas);
  }

  async function carregarMeta() {
    const res = await fetch('/api/logistica/meta');
    const data = await res.json();
    if (res.ok) {
      setMeta(data);
      setMetaAtualInput(data.metaAtual !== null ? String(Math.round(data.metaAtual)) : '');
      setMetaProximaInput(data.metaProximoTrimestre !== null ? String(Math.round(data.metaProximoTrimestre)) : '');
    }
  }

  useEffect(() => {
    calcular();
    carregarPessoas();
    carregarMeta();
  }, []);

  async function salvarMeta(alvo: 'atual' | 'proxima') {
    if (!meta) return;
    const blockChave = alvo === 'atual' ? meta.blockAtualKey : meta.blockProximoKey;
    const valorTexto = alvo === 'atual' ? metaAtualInput : metaProximaInput;
    const [blockYear, blockMonth] = blockChave.split('-').map(Number);
    const valor = Number(valorTexto);
    if (!Number.isFinite(valor) || valor < 0) {
      alert('Valor de meta inválido.');
      return;
    }
    setSalvandoMeta(alvo);
    try {
      const res = await fetch('/api/logistica/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockYear, blockMonth, meta: valor }),
      });
      const data = await res.json();
      if (res.ok) setMeta(data);
    } finally {
      setSalvandoMeta(null);
    }
  }

  async function gerarRecibos(r: ResultadoLogisticaMensal) {
    const motoristas = pessoas.filter((p) => p.ativo && p.papel === 'motorista');
    const ajudantes = pessoas.filter((p) => p.ativo && p.papel === 'ajudante');

    if (motoristas.length === 0 && ajudantes.length === 0) {
      alert('Nenhum motorista/ajudante ativo cadastrado. Cadastre em "Motoristas e ajudantes" primeiro.');
      return;
    }
    if (motoristas.length !== r.motoristasAtivos || ajudantes.length !== r.ajudantesAtivos) {
      const seguir = confirm(
        `A lista tem ${motoristas.length} motorista(s) e ${ajudantes.length} ajudante(s), mas esse mês foi calculado com ${r.motoristasAtivos} motorista(s) e ${r.ajudantesAtivos} ajudante(s). Gerar os recibos mesmo assim?`
      );
      if (!seguir) return;
    }

    const referente = `LOGÍSTICA MÊS ${MESES[r.month - 1].toUpperCase()}`;
    const recibos = [
      ...motoristas.map((p) => ({ nome: p.nome, valor: r.valorPorMotorista, referente })),
      ...ajudantes.map((p) => ({ nome: p.nome, valor: r.valorPorAjudante, referente })),
    ];

    const chave = `${r.year}-${r.month}`;
    setGerandoRecibo(chave);
    try {
      const res = await fetch('/api/logistica/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recibos }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Falha ao gerar recibos.');
        return;
      }
      const bytes = Uint8Array.from(atob(data.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob), '_blank');
    } finally {
      setGerandoRecibo(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18 }}>Resultado calculado</h2>
        <button className="btn" onClick={calcular} disabled={carregando}>
          {carregando ? 'Calculando…' : 'Recalcular'}
        </button>
      </div>

      {meta && (
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              Meta de entregas — trimestre atual ({meta.blockAtualLabel})
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                step="1"
                value={metaAtualInput}
                onChange={(e) => setMetaAtualInput(e.target.value)}
                style={{ width: 100 }}
                placeholder="ex: 150"
              />
              <button className="btn btn-secondary" onClick={() => salvarMeta('atual')} disabled={salvandoMeta === 'atual'}>
                {salvandoMeta === 'atual' ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
            {meta.metaAtual === null && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Sem histórico do trimestre anterior — lance a meta manualmente.
              </p>
            )}
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              Meta sugerida — próximo trimestre ({meta.blockProximoLabel})
              {meta.proximaMetaOverride !== null ? ' — ajustada manualmente' : ''}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                step="1"
                value={metaProximaInput}
                onChange={(e) => setMetaProximaInput(e.target.value)}
                style={{ width: 100 }}
                placeholder="ex: 150"
              />
              <button className="btn btn-secondary" onClick={() => salvarMeta('proxima')} disabled={salvandoMeta === 'proxima'}>
                {salvandoMeta === 'proxima' ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
            {meta.proximaMetaSugerida !== null && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Sugestão automática (média de entregas do trimestre atual): {meta.proximaMetaSugerida}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Entregas</th>
              <th>Meta</th>
              <th>Bateu meta?</th>
              <th>Motoristas</th>
              <th>Ajudantes</th>
              <th>Por motorista</th>
              <th>Por ajudante</th>
              <th>Total pago</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((r) => (
              <tr key={`${r.year}-${r.month}`}>
                <td>{MESES[r.month - 1]}/{r.year}</td>
                <td>{r.entregasRealizadas}</td>
                <td>{r.meta === null ? '—' : r.meta}</td>
                <td>{r.bateuMeta === null ? '—' : r.bateuMeta ? 'Sim' : 'Não'}</td>
                <td>{r.motoristasAtivos}</td>
                <td>{r.ajudantesAtivos}</td>
                <td>{brl(r.valorPorMotorista)}</td>
                <td>{brl(r.valorPorAjudante)}</td>
                <td>{brl(r.valorTotalPago)}</td>
                <td>
                  {(r.motoristasAtivos > 0 || r.ajudantesAtivos > 0) && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => gerarRecibos(r)}
                      disabled={gerandoRecibo === `${r.year}-${r.month}`}
                    >
                      {gerandoRecibo === `${r.year}-${r.month}` ? 'Gerando…' : 'Gerar recibos'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {resultado.length === 0 && !carregando && (
              <tr>
                <td colSpan={10} style={{ color: 'var(--muted)' }}>
                  Nenhum mês para calcular ainda — lance entregas em &quot;Lançar mês&quot; acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
