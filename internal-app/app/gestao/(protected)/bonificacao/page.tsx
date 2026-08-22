'use client';

import { useEffect, useState } from 'react';
import BonusCharts from './BonusCharts';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface VendedorNome {
  id: number;
  nome: string;
  ativo: boolean;
}

interface BonusMensal {
  year: number;
  month: number;
  abatimento: number;
  meta: number | null;
  percentualAtingido: number | null;
  multiplicador: number;
  valorTotalBonus: number;
  vendedoresAtivos: number;
  valorPorVendedor: number;
  valorCris: number;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (n: number | null) => (n === null ? '—' : `${(n * 100).toFixed(1)}%`);

export default function BonificacaoPage() {
  const [resultado, setResultado] = useState<BonusMensal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [nomes, setNomes] = useState<VendedorNome[]>([]);
  const [gerandoRecibo, setGerandoRecibo] = useState<string | null>(null);

  async function calcular() {
    setCarregando(true);
    try {
      const res = await fetch('/api/bonificacao/calcular', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setResultado(data.resultado);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarNomes() {
    const res = await fetch('/api/vendedores/nomes');
    const data = await res.json();
    if (res.ok) setNomes(data.nomes);
  }

  useEffect(() => {
    calcular();
    carregarNomes();
  }, []);

  async function gerarRecibos(r: BonusMensal) {
    const ativos = nomes.filter((n) => n.ativo);
    if (ativos.length === 0) {
      alert('Nenhum vendedor ativo cadastrado. Cadastre os nomes em "Vendedores ativos" primeiro.');
      return;
    }
    if (ativos.length !== r.vendedoresAtivos) {
      const seguir = confirm(
        `A lista de vendedores ativos agora tem ${ativos.length} nome(s), mas esse mês foi calculado com ${r.vendedoresAtivos} vendedor(es). Gerar os recibos mesmo assim?`
      );
      if (!seguir) return;
    }

    const referente = `PRÊMIO MÊS ${MESES[r.month - 1].toUpperCase()}`;
    const recibos = [
      ...ativos.map((n) => ({ nome: n.nome, valor: r.valorPorVendedor, referente })),
      { nome: 'Cris', valor: r.valorCris, referente },
    ];

    const chave = `${r.year}-${r.month}`;
    setGerandoRecibo(chave);
    try {
      const res = await fetch('/api/bonificacao/recibos', {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Bonificação de vendedores (Construmix)</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
            Meta trimestral móvel (média do ABATIMENTO do trimestre anterior) + faixas de
            multiplicador + 1% do faturamento real + divisão pelos vendedores ativos do mês.
            A Cris recebe 50% do valor de um vendedor.
          </p>
        </div>
        <button className="btn" onClick={calcular} disabled={carregando}>
          {carregando ? 'Calculando…' : 'Recalcular'}
        </button>
      </div>

      <BonusCharts dados={resultado} />

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>ABATIMENTO</th>
              <th>Meta</th>
              <th>% Atingido</th>
              <th>Multiplicador</th>
              <th>Bônus total</th>
              <th>Vendedores</th>
              <th>Por vendedor</th>
              <th>Cris</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((r) => (
              <tr key={`${r.year}-${r.month}`}>
                <td>{MESES[r.month - 1]}/{r.year}</td>
                <td>{brl(r.abatimento)}</td>
                <td>{r.meta === null ? '—' : brl(r.meta)}</td>
                <td>{pct(r.percentualAtingido)}</td>
                <td>{(r.multiplicador * 100).toFixed(0)}%</td>
                <td>{brl(r.valorTotalBonus)}</td>
                <td>{r.vendedoresAtivos}</td>
                <td>{brl(r.valorPorVendedor)}</td>
                <td>{brl(r.valorCris)}</td>
                <td>
                  {r.valorPorVendedor > 0 && (
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
                  Nenhum mês para calcular ainda — cadastre faturamento em Faturamento e vendedores ativos em Vendedores ativos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
