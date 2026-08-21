# Gestão + Orçamento Construmix (integrado ao Zeus)

App interno (não é o site institucional), rodando nos computadores fixos da
loja, com dois módulos:

- **`/gestao`** — protegido por senha (`GESTAO_PASSWORD`). Faturamento,
  vendedores ativos, bonificação e comparativos entre empresas.
- **`/orcamento`** — aberto, sem login, uso pelos vendedores no balcão.

Este diretório é uma aplicação Next.js **separada** do site institucional
que vive na raiz do repositório (`siteconstrumix`). O site institucional é
exportado como HTML estático (`output: 'export'`) e não tem servidor; este
app precisa de servidor Node (SQLite local + conexões PostgreSQL), então foi
mantido isolado para não quebrar o build/deploy do site público.

## Rodando localmente

```bash
cd internal-app
npm install
cp .env.example .env.local   # preencher GESTAO_PASSWORD e SESSION_SECRET no mínimo
npm run seed                 # carrega um catálogo de produtos de amostra (não é o catálogo real do Zeus)
npm run dev
```

Testes da regra de bonificação (não dependem de banco nenhum):

```bash
npm test
```

## O banco do Zeus (confirmado por inspeção direta em 2026-08)

A especificação original supunha Firebird/InterBase — na prática o Zeus
roda em **PostgreSQL 9.5**, um servidor só, servindo as 3 empresas em
bancos separados: `base_construmix`, `base_samscomercio`, `base_newhouse`
(mais um `_images` e um `_zupdate` por empresa, que não usamos). O suporte
do Zeus já criou um usuário de consulta dedicado (`usuario_consulta`), mais
seguro que usar o `postgres` de administração.

Tabelas relevantes já mapeadas (nomes reais, confirmados no schema):

- **`prevendas`** — o pedido de venda ("prevenda" é o nome do Zeus pra
  isso). Tem `valortotal`, `codvendedor`, `datavenda`.
- **`prevendas_faturamento`** — não guarda valor, é só um carimbo
  (`codprevenda` + `datahora` + usuário) marcando quando aquele pedido foi
  faturado/fechado. É essa data que define "o mês", não a data do pedido.
  Isso é o "faturamento de pedidos" da especificação — diferente de
  `saidasnf_faturamento`, que é o faturamento por nota fiscal.
- **`prevendasprod`** — itens de cada pedido, ligados a `produtos` via
  `codproduto`.
- **`produtos`** — catálogo (~6.000+ itens), com `codgrupo` (categoria,
  via a tabela `grupos`) e `codncm` (código fiscal).
- **Cimento**: o grupo interno "CIMENTO" (código 54) existe, mas boa parte
  dos cimentos de verdade está cadastrada como "DIVERSOS" (código 1) —
  cadastro inconsistente, como o Marcos já esperava. O NCM fiscal (2523.xx,
  cimento Portland) é mais confiável. Regra usada:
  `codncm LIKE '2523%' OR codgrupo = 54`.

Ver `lib/postgres/construmixFaturamento.ts` e `lib/postgres/cimentoFilter.ts`
para as queries reais escritas a partir disso.

## O que já está pronto de verdade

- **Cálculo de bonificação** (`lib/bonus.ts` + `lib/bonus.test.ts`): meta
  trimestral móvel, tabela de faixas/multiplicador, valor por vendedor e
  regra da Cris — implementado e testado exatamente como fechado na
  especificação. Independe de qualquer banco.
- **Banco de dados próprio da aplicação** (SQLite, `lib/db/`): histórico de
  orçamentos, índice de busca de produtos (FTS5), configuração mensal de
  vendedores ativos e histórico de bonificação calculada.
- **Módulo Orçamento** ponta a ponta com dados de amostra: busca de
  produtos (full-text + dicionário de sinônimos), montagem do orçamento e
  geração de PDF (com paginação real para orçamentos longos).
- **Login do módulo Gestão** (senha + cookie de sessão assinado), isolado
  num grupo de rotas `(protected)` para o layout autenticado nunca embrulhar
  a própria página de login.
- **Dashboard visual da bonificação** (`/gestao/bonificacao`): gráficos de
  Abatimento x Meta e de Bônus total por mês, com tooltip, legenda, tabela
  completa como alternativa acessível, e exportação para PNG — a base para
  o requisito de "dashboards prontos para apresentação".
- **Histórico de orçamentos** (`/gestao/orcamentos`), visível para gestão.
- **Queries reais de faturamento de pedidos, vendas de cimento e catálogo**
  (`lib/postgres/`), escritas a partir do schema real do Postgres do Zeus.

## Sobre acesso ao Postgres do Zeus

Este app **roda dentro da própria loja**, num computador da rede local —
não precisa (e não deve) expor o Postgres do Zeus à internet. Em produção
o `HOST` em `.env.local` é o IP local do servidor Postgres (ex:
`192.168.x.x`), na mesma rede.

O único lugar onde "acesso de fora" importava era esta sessão de
desenvolvimento (rodando na nuvem) tentando validar as queries contra
dados reais — e isso já foi resolvido sem expor nada: alguém com acesso
físico/local roda a consulta no pgAdmin e cola o resultado aqui. Esse
caminho continua valendo pra validar os números antes de confiar neles.

## O que está deliberadamente pendente

1. **Validar os números contra a planilha de referência (META_2026).** As
   queries de faturamento de pedidos e vendas de cimento ainda não
   excluem cancelamentos/devoluções (tabelas `prevendas_cancelamento` e
   `prevendas_devolucoes_*`, vistas no schema mas não inspecionadas) — e
   achamos pelo menos um produto de cimento fora do padrão de NCM
   ("CIMENTO BRANCO 1KG"). Comparar com números reais antes de confiar.
2. **Modelo visual do PDF de orçamento já usado na Construmix** —
   `lib/pdf.ts` gera um layout funcional simples que precisa ser
   substituído pelo modelo real (cores, logo, cabeçalho/rodapé) quando o
   Marcos compartilhar o exemplo.
3. **Comparativos entre empresas** (`/gestao/comparativos`) — hoje é uma
   tela explicando o bloqueio, porque ainda não foi testado contra os 3
   bancos reais (ver item 1). O padrão de dashboard exportável (gráfico +
   tabela + PNG) já existe em `/gestao/bonificacao/BonusCharts.tsx` e pode
   ser reaproveitado aqui.
4. **IP local do servidor Postgres na rede da loja**, pra preencher
   `POSTGRES_*_HOST` em `.env.local` quando o app for instalado de verdade
   num computador da loja (ver seção acima).

## Arquitetura

```
internal-app/
  app/
    gestao/
      login/            página de login (fora do grupo protegido)
      (protected)/       tudo que exige sessão: layout.tsx valida + nav;
                          painel, faturamento, vendedores, bonificação
                          (com BonusCharts.tsx), histórico de orçamentos,
                          comparativos
    orcamento/        módulo aberto (busca produtos, monta orçamento, gera PDF)
    api/               route handlers (auth, produtos/search, orcamento, bonificacao/calcular)
  lib/
    bonus.ts           motor de cálculo da bonificação (puro, testado)
    auth.ts             sessão do módulo Gestão
    pdf.ts               geração de PDF do orçamento
    db/                  banco próprio (SQLite): schema.sql + repositórios
    postgres/            conectores aos 3 bancos do Zeus, com as queries
                          reais de faturamento/cimento/catálogo já escritas
  data/mock-catalog.json amostra de produtos para dev (NÃO é o catálogo real)
  scripts/seed-catalog.ts carrega o catálogo de amostra no SQLite local
```

## Próximos passos (ordem sugerida)

1. Rodar `lib/postgres/construmixFaturamento.ts` e `cimentoFilter.ts`
   contra o banco real (via pgAdmin, colando resultado nesta conversa, ou
   já instalando o app na loja) e validar o ABATIMENTO calculado contra a
   planilha META_2026 — ajustar a exclusão de cancelamentos/devoluções se
   precisar.
2. Ligar `lib/postgres/catalogSync.ts` de verdade e agendar a sincronização
   periódica do catálogo (6.000+ produtos).
3. Substituir o layout de `lib/pdf.ts` pelo modelo real da Construmix.
4. Implementar `/gestao/comparativos` com os 3 bancos conectados.
5. Instalar o app num computador da loja com acesso à rede local do
   Postgres, e preencher `.env.local` com o IP local real.
