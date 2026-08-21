'use client';

import { useEffect, useState } from 'react';
import BonusCharts from './BonusCharts';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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

  useEffect(() => {
    calcular();
  }, []);

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
              </tr>
            ))}
            {resultado.length === 0 && !carregando && (
              <tr>
                <td colSpan={9} style={{ color: 'var(--muted)' }}>
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
