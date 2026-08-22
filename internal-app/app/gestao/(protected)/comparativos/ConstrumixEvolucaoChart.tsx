'use client';

import { useRef, useState } from 'react';
import ChartTooltip from '@/components/ChartTooltip';
import { CHART_COLORS, exportChartsAsPng, niceMax, type TooltipState } from '@/lib/chartUtils';
import type { MesEvolucao } from '@/lib/postgres/construmixEvolucao';

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brlCompacto = (n: number) => (n >= 1000 ? `R$ ${(n / 1000).toFixed(0)}k` : `R$ ${n.toFixed(0)}`);

export default function ConstrumixEvolucaoChart({ serie }: { serie: MesEvolucao[] }) {
  const width = 760;
  const height = 300;
  const margin = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxValor = niceMax(Math.max(1, ...serie.map((m) => m.faturamento)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValor);
  const barW = Math.min(28, (innerW / Math.max(1, serie.length)) * 0.6);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (serie.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 15 }}>Evolução mensal — faturamento de pré-venda Construmix</h2>
        <button
          className="btn btn-secondary"
          onClick={() => exportChartsAsPng('evolucao-construmix-chart', 'evolucao-construmix.png')}
        >
          Baixar imagem (PNG)
        </button>
      </div>

      <div id="evolucao-construmix-chart" style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Evolução mensal do faturamento de pré-venda da Construmix">
          <rect x={0} y={0} width={width} height={height} fill={CHART_COLORS.surface} />
          <g transform={`translate(${margin.left},${margin.top})`}>
            {ticks.map((t) => {
              const ty = innerH - (t / maxValor) * innerH;
              return (
                <g key={t}>
                  <line x1={0} x2={innerW} y1={ty} y2={ty} stroke={CHART_COLORS.grid} strokeWidth={1} />
                  <text x={-8} y={ty} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={CHART_COLORS.textSecondary}>
                    {brlCompacto(t)}
                  </text>
                </g>
              );
            })}

            {serie.map((m, i) => {
              const grupoW = innerW / serie.length;
              const cx = i * grupoW + grupoW / 2;
              const barH = (m.faturamento / maxValor) * innerH;
              const bx = cx - barW / 2;
              const cor = m.faturamento === 0 ? CHART_COLORS.grid : '#2a78d6';

              const linhas = [
                `${MESES_ABREV[m.month - 1]}/${String(m.year).slice(-2)}`,
                brl(m.faturamento),
                m.crescimentoMesAnterior !== null
                  ? `${m.crescimentoMesAnterior >= 0 ? '+' : ''}${m.crescimentoMesAnterior.toFixed(1)}% vs. mês anterior`
                  : 'sem mês anterior pra comparar',
              ];
              const onHover = (evt: React.MouseEvent) => {
                const rect = svgRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({ x: evt.clientX - rect.left, y: evt.clientY - rect.top, linhas });
              };

              return (
                <g key={`${m.year}-${m.month}`}>
                  <rect
                    x={bx}
                    y={innerH - barH}
                    width={barW}
                    height={Math.max(0, barH)}
                    rx={3}
                    fill={cor}
                    onMouseMove={onHover}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {(i % Math.max(1, Math.ceil(serie.length / 12)) === 0) && (
                    <text x={cx} y={innerH + 16} textAnchor="middle" fontSize={10} fill={CHART_COLORS.textSecondary}>
                      {MESES_ABREV[m.month - 1]}/{String(m.year).slice(-2)}
                    </text>
                  )}
                </g>
              );
            })}

            <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke={CHART_COLORS.grid} strokeWidth={1} />
          </g>
        </svg>

        {tooltip && <ChartTooltip tooltip={tooltip} />}
      </div>
    </div>
  );
}
