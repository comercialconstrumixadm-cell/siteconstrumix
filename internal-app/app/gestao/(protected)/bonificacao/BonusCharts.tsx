'use client';

import { useMemo, useRef, useState } from 'react';

interface BonusMensal {
  year: number;
  month: number;
  abatimento: number;
  meta: number | null;
  valorTotalBonus: number;
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * Paleta fixa em hex puro (sem CSS custom properties). Duas razões:
 * 1. O resto do app ainda não tem tema escuro (globals.css é só claro), e
 *    "seguir" o dark mode do sistema apenas neste componente deixaria o
 *    texto claro sobre o fundo branco do .card — pior contraste, não
 *    melhor (confirmado visualmente antes desta versão).
 * 2. `var(--x)` dentro de um <svg> não resolve quando o SVG é serializado
 *    sozinho (fora do DOM) para exportar como PNG — os elementos caem no
 *    valor inicial do SVG (fill preto, stroke nenhum), perdendo toda cor.
 *    Hex direto evita os dois problemas de uma vez.
 */
const COLORS = {
  grid: '#e3e8e1',
  textSecondary: '#667169',
  series1: '#2a78d6', // Abatimento realizado
  series2: '#eb6834', // Bônus total
  series3: '#1baf7a', // Meta vigente
  surface: '#ffffff',
  tooltipBg: '#17241a',
  tooltipText: '#ffffff',
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const brlCompacto = (n: number) => {
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
};

interface TooltipState {
  x: number;
  y: number;
  linhas: string[];
}

function niceMax(max: number): number {
  if (max <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalizado = max / magnitude;
  const passo = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return passo * magnitude;
}

function Tooltip({ tooltip }: { tooltip: TooltipState }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: tooltip.x + 12,
        top: tooltip.y - 8,
        background: COLORS.tooltipBg,
        color: COLORS.tooltipText,
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 12,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,.2)',
      }}
    >
      {tooltip.linhas.map((l, i) => (
        <div key={i} style={{ fontWeight: i === 0 ? 700 : 400 }}>{l}</div>
      ))}
    </div>
  );
}

/**
 * Gráfico "Abatimento x Meta por mês" — comparação de magnitude na mesma
 * escala (R$), por isso os dois compartilham um único eixo (nunca eixo
 * duplo). Bônus total tem escala bem menor e vive em um gráfico separado
 * logo abaixo.
 */
function ChartAbatimentoMeta({ dados }: { dados: BonusMensal[] }) {
  const width = 640;
  const height = 280;
  const margin = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxValor = niceMax(Math.max(1, ...dados.map((d) => Math.max(d.abatimento, d.meta ?? 0))));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValor);

  const grupoW = innerW / dados.length;
  const barW = Math.min(24, grupoW * 0.32);
  const gap = 2;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Abatimento realizado x meta vigente, por mês">
        <rect x={0} y={0} width={width} height={height} fill={COLORS.surface} />
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((t) => {
            const ty = innerH - (t / maxValor) * innerH;
            return (
              <g key={t}>
                <line x1={0} x2={innerW} y1={ty} y2={ty} stroke={COLORS.grid} strokeWidth={1} />
                <text x={-8} y={ty} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={COLORS.textSecondary}>
                  {brlCompacto(t)}
                </text>
              </g>
            );
          })}

          {dados.map((d, i) => {
            const gx = i * grupoW;
            const abatimentoH = (d.abatimento / maxValor) * innerH;
            const metaH = ((d.meta ?? 0) / maxValor) * innerH;
            const cx = gx + grupoW / 2;
            const xAbatimento = cx - gap / 2 - barW;
            const xMeta = cx + gap / 2;

            const linhas = [
              `${MESES_ABREV[d.month - 1]}/${String(d.year).slice(-2)}`,
              `Abatimento: ${brl(d.abatimento)}`,
              d.meta !== null ? `Meta: ${brl(d.meta)}` : 'Meta: sem histórico suficiente',
            ];
            const onHover = (evt: React.MouseEvent) => {
              const rect = svgRef.current?.getBoundingClientRect();
              if (!rect) return;
              setTooltip({ x: evt.clientX - rect.left, y: evt.clientY - rect.top, linhas });
            };

            return (
              <g key={`${d.year}-${d.month}`} onMouseMove={onHover} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
                <rect x={gx} y={0} width={grupoW} height={innerH} fill="transparent" />
                <rect
                  x={xAbatimento}
                  y={innerH - abatimentoH}
                  width={barW}
                  height={Math.max(0, abatimentoH)}
                  rx={4}
                  fill={COLORS.series1}
                />
                {d.meta !== null && (
                  <rect
                    x={xMeta}
                    y={innerH - metaH}
                    width={barW}
                    height={Math.max(0, metaH)}
                    rx={4}
                    fill={COLORS.series3}
                  />
                )}
                <text x={cx} y={innerH + 16} textAnchor="middle" fontSize={10} fill={COLORS.textSecondary}>
                  {MESES_ABREV[d.month - 1]}/{String(d.year).slice(-2)}
                </text>
              </g>
            );
          })}

          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      </svg>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
        <span><i style={legendDot(COLORS.series1)} /> Abatimento realizado</span>
        <span><i style={legendDot(COLORS.series3)} /> Meta vigente</span>
      </div>

      {tooltip && <Tooltip tooltip={tooltip} />}
    </div>
  );
}

/** Gráfico "Bônus total por mês" — série única, escala própria (nunca no mesmo eixo do gráfico acima). */
function ChartBonusTotal({ dados }: { dados: BonusMensal[] }) {
  const width = 640;
  const height = 220;
  const margin = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxValor = niceMax(Math.max(1, ...dados.map((d) => d.valorTotalBonus)));
  const ticks = [0, 0.5, 1].map((f) => f * maxValor);

  const grupoW = innerW / dados.length;
  const barW = Math.min(24, grupoW * 0.5);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Valor total do bônus, por mês">
        <rect x={0} y={0} width={width} height={height} fill={COLORS.surface} />
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((t) => {
            const ty = innerH - (t / maxValor) * innerH;
            return (
              <g key={t}>
                <line x1={0} x2={innerW} y1={ty} y2={ty} stroke={COLORS.grid} strokeWidth={1} />
                <text x={-8} y={ty} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={COLORS.textSecondary}>
                  {brlCompacto(t)}
                </text>
              </g>
            );
          })}

          {dados.map((d, i) => {
            const gx = i * grupoW;
            const barH = (d.valorTotalBonus / maxValor) * innerH;
            const cx = gx + grupoW / 2;

            const linhas = [`${MESES_ABREV[d.month - 1]}/${String(d.year).slice(-2)}`, `Bônus total: ${brl(d.valorTotalBonus)}`];
            const onHover = (evt: React.MouseEvent) => {
              const rect = svgRef.current?.getBoundingClientRect();
              if (!rect) return;
              setTooltip({ x: evt.clientX - rect.left, y: evt.clientY - rect.top, linhas });
            };

            return (
              <g key={`${d.year}-${d.month}`} onMouseMove={onHover} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
                <rect x={gx} y={0} width={grupoW} height={innerH} fill="transparent" />
                <rect x={cx - barW / 2} y={innerH - barH} width={barW} height={Math.max(0, barH)} rx={4} fill={COLORS.series2} />
                {d.valorTotalBonus > 0 && (
                  <text x={cx} y={innerH - barH - 6} textAnchor="middle" fontSize={9} fill={COLORS.textSecondary}>
                    {brlCompacto(d.valorTotalBonus)}
                  </text>
                )}
                <text x={cx} y={innerH + 16} textAnchor="middle" fontSize={10} fill={COLORS.textSecondary}>
                  {MESES_ABREV[d.month - 1]}/{String(d.year).slice(-2)}
                </text>
              </g>
            );
          })}

          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      </svg>

      {tooltip && <Tooltip tooltip={tooltip} />}
    </div>
  );
}

function legendDot(color: string): React.CSSProperties {
  return {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 4,
    background: color,
    marginRight: 6,
  };
}

async function exportarComoPng(containerId: string, nomeArquivo: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svgs = Array.from(container.querySelectorAll('svg'));
  if (svgs.length === 0) return;

  const escala = 2;
  const canvas = document.createElement('canvas');
  const totalHeight = svgs.reduce((sum, svg) => sum + svg.viewBox.baseVal.height, 0) + 40;
  const width = svgs[0].viewBox.baseVal.width;
  canvas.width = width * escala;
  canvas.height = totalHeight * escala;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(escala, escala);
  ctx.fillStyle = COLORS.surface;
  ctx.fillRect(0, 0, width, totalHeight);

  let offsetY = 8;
  for (const svg of svgs) {
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    ctx.drawImage(img, 0, offsetY, svg.viewBox.baseVal.width, svg.viewBox.baseVal.height);
    URL.revokeObjectURL(url);
    offsetY += svg.viewBox.baseVal.height + 24;
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png');
}

export default function BonusCharts({ dados }: { dados: BonusMensal[] }) {
  const dadosOrdenados = useMemo(
    () => dados.slice().sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)),
    [dados]
  );

  if (dadosOrdenados.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 15 }}>Dashboard — pronto para apresentação</h2>
        <button className="btn btn-secondary" onClick={() => exportarComoPng('bonus-charts', 'bonificacao-construmix.png')}>
          Baixar imagem (PNG)
        </button>
      </div>

      <div id="bonus-charts" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Abatimento x Meta por mês</p>
          <ChartAbatimentoMeta dados={dadosOrdenados} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Bônus total por mês</p>
          <ChartBonusTotal dados={dadosOrdenados} />
        </div>
      </div>
    </div>
  );
}
