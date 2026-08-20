import { queryZeus } from './client';

/**
 * PENDENTE: como isolar vendas de cimento no banco da Construmix
 * (categoria de produto, CEST, código/prefixo específico, ou outro
 * campo)? Precisa ser confirmado olhando o schema real do Zeus antes de
 * implementar o filtro. Ver checklist item 4 da especificação.
 *
 * Configuração provisória: FIREBIRD_CONSTRUMIX_CIMENTO_FILTRO em
 * .env.local pode guardar, por exemplo, uma lista de códigos de categoria
 * separados por vírgula, para uso na query abaixo assim que o relatório de
 * faturamento de pedidos também estiver identificado.
 */
export async function getVendasCimentoMensal(_year: number, _month: number): Promise<number> {
  const filtro = process.env.FIREBIRD_CONSTRUMIX_CIMENTO_FILTRO;
  if (!filtro) {
    throw new Error(
      'Filtro de identificação de "vendas de cimento" ainda não definido. ' +
        'Ver lib/firebird/cimentoFilter.ts e o checklist da especificação.'
    );
  }

  // Placeholder: assume que FIREBIRD_CONSTRUMIX_CIMENTO_FILTRO é a query
  // SQL completa até o schema real do Zeus ser inspecionado.
  const rows = await queryZeus<{ TOTAL: number }>('construmix', filtro, [_year, _month]);
  return rows[0]?.TOTAL ?? 0;
}
