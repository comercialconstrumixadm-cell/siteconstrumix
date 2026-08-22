import type { CSSProperties } from 'react';

/**
 * Peças compartilhadas entre os gráficos do app (BonusCharts.tsx,
 * ComparativoChart.tsx) — cores base, tooltip, arredondamento de eixo e
 * exportação pra PNG. Extraído depois que os dois componentes começaram a
 * duplicar isso e derivar aos poucos (ver revisão de código).
 */

/**
 * Paleta base em hex puro (sem CSS custom properties). Duas razões:
 * 1. O resto do app ainda não tem tema escuro (globals.css é só claro), e
 *    "seguir" o dark mode do sistema apenas num componente deixaria o
 *    texto claro sobre o fundo branco do .card — pior contraste, não
 *    melhor (confirmado visualmente).
 * 2. `var(--x)` dentro de um <svg> não resolve quando o SVG é serializado
 *    sozinho (fora do DOM) para exportar como PNG — os elementos caem no
 *    valor inicial do SVG (fill preto, stroke nenhum), perdendo toda cor.
 *    Hex direto evita os dois problemas de uma vez.
 *
 * As cores de série (por grupo/empresa) ficam em cada componente, já que
 * variam por gráfico.
 */
export const CHART_COLORS = {
  grid: '#e3e8e1',
  textSecondary: '#667169',
  surface: '#ffffff',
  tooltipBg: '#17241a',
  tooltipText: '#ffffff',
};

export interface TooltipState {
  x: number;
  y: number;
  linhas: string[];
}

export function niceMax(max: number): number {
  if (max <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalizado = max / magnitude;
  const passo = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return passo * magnitude;
}

export function legendDot(color: string): CSSProperties {
  return {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 4,
    background: color,
    marginRight: 6,
  };
}

/**
 * Exporta todo <svg> dentro de `containerId` como uma única imagem PNG
 * (empilhados verticalmente se houver mais de um). Usado pelo botão
 * "Baixar imagem (PNG)" dos dashboards.
 */
export async function exportChartsAsPng(containerId: string, nomeArquivo: string, surfaceColor = CHART_COLORS.surface) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svgs = Array.from(container.querySelectorAll('svg'));
  if (svgs.length === 0) return;

  const escala = 2;
  const canvas = document.createElement('canvas');
  const totalHeight = svgs.reduce((sum, svg) => sum + svg.viewBox.baseVal.height, 0) + 40;
  const width = Math.max(...svgs.map((svg) => svg.viewBox.baseVal.width));
  canvas.width = width * escala;
  canvas.height = totalHeight * escala;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(escala, escala);
  ctx.fillStyle = surfaceColor;
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

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(link.href);
      }
      resolve();
    }, 'image/png');
  });
}
