import { describe, expect, it } from 'vitest';
import {
  calcularAbatimento,
  calcularBonusSerie,
  calcularMetasTrimestrais,
  getMultiplicador,
  type MonthlyAbatimento,
  type VendedoresAtivosConfig,
} from './bonus';

describe('calcularAbatimento', () => {
  it('subtrai vendas de cimento do faturamento de pedidos', () => {
    expect(calcularAbatimento(150000, 50000)).toBe(100000);
  });
});

describe('getMultiplicador', () => {
  it.each([
    [0, 0],
    [0.4, 0],
    [0.41, 0.3],
    [0.5, 0.3],
    [0.51, 0.4],
    [0.6, 0.4],
    [0.61, 0.5],
    [0.7, 0.5],
    [0.71, 0.6],
    [0.8, 0.6],
    [0.81, 0.7],
    [0.99, 0.7],
    [1.0, 1.0],
    [1.2, 1.0],
  ])('percentual %f -> multiplicador %f', (pct, expected) => {
    expect(getMultiplicador(pct)).toBeCloseTo(expected);
  });
});

describe('calcularMetasTrimestrais', () => {
  it('usa a média do trimestre civil anterior (exemplo da especificação)', () => {
    const series: MonthlyAbatimento[] = [
      { year: 2026, month: 1, abatimento: 100000 },
      { year: 2026, month: 2, abatimento: 100000 },
      { year: 2026, month: 3, abatimento: 100000 },
      { year: 2026, month: 4, abatimento: 90000 },
      { year: 2026, month: 5, abatimento: 110000 },
      { year: 2026, month: 6, abatimento: 130000 },
      { year: 2026, month: 7, abatimento: 100000 },
    ];
    const metas = calcularMetasTrimestrais(series);

    // Jan/Fev/Mar não têm trimestre anterior completo na série.
    expect(metas.get('2026-1')).toBeNull();
    expect(metas.get('2026-2')).toBeNull();
    expect(metas.get('2026-3')).toBeNull();

    // Abr/Mai/Jun usam a média de Jan+Fev+Mar = 100.000
    expect(metas.get('2026-4')).toBe(100000);
    expect(metas.get('2026-5')).toBe(100000);
    expect(metas.get('2026-6')).toBe(100000);

    // Jul usa a média de Abr+Mai+Jun = (90000+110000+130000)/3 = 110.000
    expect(metas.get('2026-7')).toBe(110000);
  });
});

describe('calcularBonusSerie', () => {
  it('calcula bônus total, por vendedor e da Cris (exemplo 100% da meta)', () => {
    const abatimentos: MonthlyAbatimento[] = [
      { year: 2026, month: 1, abatimento: 100000 },
      { year: 2026, month: 2, abatimento: 100000 },
      { year: 2026, month: 3, abatimento: 100000 },
      { year: 2026, month: 4, abatimento: 100000 },
    ];
    const vendedores: VendedoresAtivosConfig[] = [
      { year: 2026, month: 4, vendedoresAtivos: 5 },
    ];

    const resultado = calcularBonusSerie(abatimentos, vendedores);
    const abril = resultado.find((r) => r.month === 4)!;

    expect(abril.meta).toBe(100000);
    expect(abril.percentualAtingido).toBeCloseTo(1.0);
    expect(abril.multiplicador).toBeCloseTo(1.0);
    // Bonus total = 100% x (100.000 x 1%) = 1.000
    expect(abril.valorTotalBonus).toBeCloseTo(1000);
    // Por vendedor = 1.000 / 5 = 200
    expect(abril.valorPorVendedor).toBeCloseTo(200);
    // Cris = 50% de 200 = 100
    expect(abril.valorCris).toBeCloseTo(100);
  });

  it('calcula uma faixa intermediária (75% da meta -> multiplicador 60%)', () => {
    const abatimentos: MonthlyAbatimento[] = [
      { year: 2026, month: 1, abatimento: 100000 },
      { year: 2026, month: 2, abatimento: 100000 },
      { year: 2026, month: 3, abatimento: 100000 },
      { year: 2026, month: 4, abatimento: 75000 },
    ];
    const vendedores: VendedoresAtivosConfig[] = [
      { year: 2026, month: 4, vendedoresAtivos: 5 },
    ];

    const resultado = calcularBonusSerie(abatimentos, vendedores);
    const abril = resultado.find((r) => r.month === 4)!;

    expect(abril.percentualAtingido).toBeCloseTo(0.75);
    expect(abril.multiplicador).toBeCloseTo(0.6);
    // Bonus total = 60% x (75.000 x 1%) = 450
    expect(abril.valorTotalBonus).toBeCloseTo(450);
    expect(abril.valorPorVendedor).toBeCloseTo(90);
    expect(abril.valorCris).toBeCloseTo(45);
  });

  it('sem meses de histórico suficientes, meta é null e bônus é zero', () => {
    const abatimentos: MonthlyAbatimento[] = [
      { year: 2026, month: 1, abatimento: 100000 },
    ];
    const resultado = calcularBonusSerie(abatimentos, []);
    expect(resultado[0].meta).toBeNull();
    expect(resultado[0].percentualAtingido).toBeNull();
    expect(resultado[0].valorTotalBonus).toBe(0);
  });

  it('número de vendedores ativos é variável por mês', () => {
    const abatimentos: MonthlyAbatimento[] = [
      { year: 2026, month: 1, abatimento: 100000 },
      { year: 2026, month: 2, abatimento: 100000 },
      { year: 2026, month: 3, abatimento: 100000 },
      { year: 2026, month: 4, abatimento: 100000 },
      { year: 2026, month: 5, abatimento: 100000 },
    ];
    const vendedores: VendedoresAtivosConfig[] = [
      { year: 2026, month: 4, vendedoresAtivos: 4 },
      { year: 2026, month: 5, vendedoresAtivos: 5 },
    ];

    const resultado = calcularBonusSerie(abatimentos, vendedores);
    const abril = resultado.find((r) => r.month === 4)!;
    const maio = resultado.find((r) => r.month === 5)!;

    expect(abril.valorPorVendedor).toBeCloseTo(1000 / 4);
    expect(maio.valorPorVendedor).toBeCloseTo(1000 / 5);
  });
});
