import { describe, expect, it } from 'vitest';
import { calcularLucroPresumidoTrimestral, calcularPisCofinsMensal, calcularSimplesNacional, trimestreCivil } from './impostos';

describe('calcularSimplesNacional (Anexo I - Comércio)', () => {
  it('faixa 1 (até 180.000): alíquota nominal 4%, sem parcela a deduzir', () => {
    const r = calcularSimplesNacional(100_000, 10_000);
    expect(r.foraDoLimite).toBe(false);
    expect(r.faixa?.aliquotaNominal).toBeCloseTo(0.04);
    // efetiva = (100000*0.04 - 0) / 100000 = 0.04
    expect(r.aliquotaEfetiva).toBeCloseTo(0.04);
    expect(r.valorDevido).toBeCloseTo(400); // 4% de 10.000
  });

  it('faixa 2 (180.000,01 a 360.000): exemplo clássico RBT12=200.000', () => {
    const r = calcularSimplesNacional(200_000, 20_000);
    expect(r.faixa?.aliquotaNominal).toBeCloseTo(0.073);
    // efetiva = (200000*0.073 - 5940) / 200000 = 8660/200000 = 0.0433
    expect(r.aliquotaEfetiva).toBeCloseTo(0.0433, 4);
    expect(r.valorDevido).toBeCloseTo(0.0433 * 20_000, 1);
  });

  it('no limite exato de uma faixa, usa a faixa correspondente (limite inclusivo)', () => {
    const r = calcularSimplesNacional(180_000, 10_000);
    expect(r.faixa?.aliquotaNominal).toBeCloseTo(0.04);
  });

  it('RBT12 acima do teto (4.800.000): fora do limite, sem cálculo', () => {
    const r = calcularSimplesNacional(5_000_000, 100_000);
    expect(r.foraDoLimite).toBe(true);
    expect(r.valorDevido).toBe(0);
  });

  it('RBT12 zero (empresa nova, sem histórico): não quebra, retorna zero', () => {
    const r = calcularSimplesNacional(0, 10_000);
    expect(r.aliquotaEfetiva).toBe(0);
    expect(r.valorDevido).toBe(0);
  });
});

describe('calcularLucroPresumidoTrimestral (comércio)', () => {
  it('abaixo do limite do adicional de IRPJ (sem adicional)', () => {
    // receita trimestral 500.000 -> base IRPJ = 8% = 40.000 (< 60.000, sem adicional)
    const r = calcularLucroPresumidoTrimestral(500_000);
    expect(r.baseIrpj).toBeCloseTo(40_000);
    expect(r.irpjNormal).toBeCloseTo(6_000); // 15% de 40.000
    expect(r.irpjAdicional).toBe(0);
    expect(r.irpjTotal).toBeCloseTo(6_000);
    expect(r.baseCsll).toBeCloseTo(60_000); // 12% de 500.000
    expect(r.csll).toBeCloseTo(5_400); // 9% de 60.000
    expect(r.totalTrimestre).toBeCloseTo(11_400);
  });

  it('acima do limite do adicional de IRPJ (com adicional)', () => {
    // receita trimestral 1.000.000 -> base IRPJ = 8% = 80.000 (> 60.000, excedente 20.000)
    const r = calcularLucroPresumidoTrimestral(1_000_000);
    expect(r.baseIrpj).toBeCloseTo(80_000);
    expect(r.irpjNormal).toBeCloseTo(12_000); // 15% de 80.000
    expect(r.irpjAdicional).toBeCloseTo(2_000); // 10% de (80.000-60.000)
    expect(r.irpjTotal).toBeCloseTo(14_000);
  });
});

describe('calcularPisCofinsMensal', () => {
  it('aplica 0,65% PIS e 3% COFINS sobre a receita do mês', () => {
    const r = calcularPisCofinsMensal(100_000);
    expect(r.pis).toBeCloseTo(650);
    expect(r.cofins).toBeCloseTo(3_000);
    expect(r.total).toBeCloseTo(3_650);
  });
});

describe('trimestreCivil', () => {
  it.each([
    [1, 1], [2, 1], [3, 1],
    [4, 2], [5, 2], [6, 2],
    [7, 3], [8, 3], [9, 3],
    [10, 4], [11, 4], [12, 4],
  ])('mês %i pertence ao trimestre civil %i', (mes, esperado) => {
    expect(trimestreCivil(mes)).toBe(esperado);
  });
});
