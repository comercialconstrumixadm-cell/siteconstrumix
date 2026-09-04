import { CHART_COLORS, type TooltipState } from '@/lib/chartUtils';

export default function ChartTooltip({ tooltip }: { tooltip: TooltipState }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: tooltip.x + 12,
        top: tooltip.y - 8,
        background: CHART_COLORS.tooltipBg,
        color: CHART_COLORS.tooltipText,
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
