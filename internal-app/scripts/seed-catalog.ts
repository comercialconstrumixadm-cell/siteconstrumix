/**
 * Popula o índice local de produtos com um catálogo de amostra, para
 * desenvolvimento/demonstração do módulo Orçamento enquanto a
 * sincronização real com o Zeus (lib/firebird/catalogSync.ts) não está
 * ligada a credenciais reais. NÃO representa o catálogo real de 6.000+
 * produtos da Construmix.
 *
 * Uso: npm run seed
 */
import { upsertProdutos } from '../lib/db/catalog';
import { addSinonimo } from '../lib/db/catalog';
import mockCatalog from '../data/mock-catalog.json';

function main() {
  upsertProdutos(mockCatalog);

  // Dicionário de sinônimos de exemplo (a loja alimenta este dicionário
  // conforme os termos que os clientes realmente usam no balcão).
  addSinonimo('caixao', 'marco');
  addSinonimo('caixao', 'batente');
  addSinonimo('porta pintada', 'pre-pintada');

  console.log(`Catálogo de amostra carregado: ${mockCatalog.length} produtos.`);
}

main();
