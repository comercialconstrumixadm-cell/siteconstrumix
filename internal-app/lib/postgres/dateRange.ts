/** Início (inclusivo) e fim (exclusivo) de um mês, em UTC, para filtrar timestamps do Postgres. */
export function monthRange(year: number, month: number): { inicio: Date; fim: Date } {
  const inicio = new Date(Date.UTC(year, month - 1, 1));
  const fim = new Date(Date.UTC(year, month, 1));
  return { inicio, fim };
}
