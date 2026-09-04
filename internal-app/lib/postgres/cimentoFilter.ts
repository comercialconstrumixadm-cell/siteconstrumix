import { queryZeus } from './client';
import { monthRange } from './dateRange';

/**
 * Identificação de "vendas de cimento" — confirmada por inspeção direta do
 * schema e dos dados em 2026-08:
 *
 * - Testamos primeiro `produtos.codgrupo` (categoria interna da loja) —
 *   existe um grupo "CIMENTO" (código 54), mas boa parte dos cimentos de
 *   verdade (sacos Zebu, Zumbi, Poty, CPII 50kg) estava incorretamente
 *   categorizada como "DIVERSOS" (código 1). Cadastro inconsistente,
 *   como o Marcos já esperava.
 * - `produtos.codncm` (código fiscal, NCM) é mais confiável: cimento
 *   Portland é NCM 2523.xx, e praticamente todo produto de cimento de
 *   verdade tem esse código, independente do grupo interno.
 *
 * Regra usada: NCM começando com "2523" OU grupo 54 ("CIMENTO"), pra
 * cobrir tanto o padrão fiscal quanto qualquer item que só esteja marcado
 * na categoria interna.
 *
 * PENDENTE — validar com o Marcos: achamos pelo menos um caso fora do
 * padrão ("CIMENTO BRANCO 1KG", NCM 6810 em vez de 2523) que vale conferir
 * manualmente. Comparar o resultado desta query com a planilha de
 * referência antes de confiar no número.
 */
const VENDAS_CIMENTO_QUERY = `
  SELECT COALESCE(SUM(pp.valortotal), 0) AS total
  FROM prevendasprod pp
  JOIN prevendas pv ON pv.codigo = pp.codprevenda
  JOIN prevendas_faturamento pf ON pf.codprevenda = pv.codigo
  JOIN produtos p ON p.codigo = pp.codproduto
  WHERE pf.datahora >= $1 AND pf.datahora < $2
    AND (p.codncm LIKE '2523%' OR p.codgrupo = 54)
`;

export async function getVendasCimentoMensal(year: number, month: number): Promise<number> {
  const { inicio, fim } = monthRange(year, month);
  const rows = await queryZeus<{ total: string }>('construmix', VENDAS_CIMENTO_QUERY, [inicio, fim]);
  return Number(rows[0]?.total ?? 0);
}
