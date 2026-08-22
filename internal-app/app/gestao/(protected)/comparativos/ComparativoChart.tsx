'use client';

import { useRef, useState } from 'react';

interface FaturamentoMensalEmpresa {
  empresa: 'construmix' | 'sams' | 'newhouse';
  year: number;
  month: number;
  erro?: string;
  faturamento?: number;
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const EMPRESAS: { chave: FaturamentoMensalEmpresa['empresa']; nome: string; cor: string }[] = [
  { chave: 'construmix', nome: 'Construmix', cor: '#2a78d6' },
  { chave: 'sams', nome: 'SAMS', cor: '#eb6834' },
  { chave: 'newhouse', nome: 'New House', cor: '#1baf7a' },
];

const COLORS = {
  grid: '#e3e8e1',
  textSecondary: '#667169',
  surface: '#ffffff',
  tooltipBg: '#17241a',
  tooltipText: '#ffffff',
};

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brlCompacto = (n: number) => (n >= 1000 ? `R$ ${(n / 1000).toFixed(0)}k` : `R$ ${n.toFixed(0)}`);

function niceMax(max: number): number {
  if (max <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalizado = max / magnitude;
  const passo = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return passo * magnitude;
}

interface TooltipState {
  x: number;
  y: number;
  linhas: string[];
}

export default function ComparativoChart({ dados }: { dados: FaturamentoMensalEmpresa[] }) {
  const meses = Array.from(new Set(dados.map((d) => `${d.year}-${d.month}`)))
    .sort()
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month };
    });

  const porChaveEMes = new Map<string, FaturamentoMensalEmpresa>();
  for (const d of dados) porChaveEMes.set(`${d.empresa}-${d.year}-${d.month}`, d);

  const empresasComDados = EMPRESAS.filter((e) =>
    meses.some((m) => porChaveEMes.get(`${e.chave}-${m.year}-${m.month}`)?.faturamento !== undefined)
  );
  const empresasSemDados = EMPRESAS.filter((e) => !empresasComDados.includes(e));

  const width = 680;
  const height = 300;
  const margin = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxValor = niceMax(
    Math.max(1, ...dados.map((d) => d.faturamento ?? 0))
  );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValor);

  const grupoW = innerW / Math.max(1, meses.length);
  const nEmpresas = Math.max(1, empresasComDados.length);
  const barW = Math.min(20, (grupoW * 0.7) / nEmpresas);
  const gap = 2;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  async function exportarPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    const escala = 2;
    canvas.width = width * escala;
    canvas.height = height * escala;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(escala, escala);
    ctx.fillStyle = COLORS.surface;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    canvas.toBlob((b) => {
      if (!b) return;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(b);
      link.download = 'comparativo-empresas.png';
      link.click();
      URL.revokeObjectURL(link.href);
    }, 'image/png');
  }

  if (empresasComDados.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 15 }}>Faturamento de pedidos por empresa, últimos meses</h2>
        <button className="btn btn-secondary" onClick={exportarPng}>Baixar imagem (PNG)</button>
      </div>

      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Faturamento de pedidos por empresa e mês">
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

            {meses.map((m, i) => {
              const gx = i * grupoW;
              const cx = gx + grupoW / 2;
              const larguraGrupo = nEmpresas * barW + (nEmpresas - 1) * gap;
              const inicioGrupo = cx - larguraGrupo / 2;

              return (
                <g key={`${m.year}-${m.month}`}>
                  {empresasComDados.map((empresa, ei) => {
                    const item = porChaveEMes.get(`${empresa.chave}-${m.year}-${m.month}`);
                    const valor = item?.faturamento;
                    const barH = valor !== undefined ? (valor / maxValor) * innerH : 0;
                    const bx = inicioGrupo + ei * (barW + gap);

                    const linhas = [
                      `${MESES_ABREV[m.month - 1]}/${String(m.year).slice(-2)} — ${empresa.nome}`,
                      valor !== undefined ? brl(valor) : 'sem dados / não configurado',
                    ];
                    const onHover = (evt: React.MouseEvent) => {
                      const rect = svgRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setTooltip({ x: evt.clientX - rect.left, y: evt.clientY - rect.top, linhas });
                    };

                    return (
                      <rect
                        key={empresa.chave}
                        x={bx}
                        y={innerH - barH}
                        width={barW}
                        height={Math.max(0, barH)}
                        rx={3}
                        fill={empresa.cor}
                        onMouseMove={onHover}
                        onMouseLeave={() => setTooltip(null)}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                  <text x={cx} y={innerH + 16} textAnchor="middle" fontSize={10} fill={COLORS.textSecondary}>
                    {MESES_ABREV[m.month - 1]}/{String(m.year).slice(-2)}
                  </text>
                </g>
              );
            })}

            <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke={COLORS.grid} strokeWidth={1} />
          </g>
        </svg>

        {tooltip && (
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
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
        {empresasComDados.map((e) => (
          <span key={e.chave}>
            <i
              style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: e.cor, marginRight: 6 }}
            />
            {e.nome}
          </span>
        ))}
      </div>

      {empresasSemDados.length > 0 && (
        <p style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 8 }}>
          Sem dados ainda: {empresasSemDados.map((e) => e.nome).join(', ')} (conexão não configurada — ver{' '}
          <code>.env.example</code>).
        </p>
      )}
    </div>
  );
}
