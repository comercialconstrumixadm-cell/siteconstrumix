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

## Rodando em produção (na loja, acessível de outros computadores)

```bash
npm run build
npm run start
```

`npm run start` roda `server.js` (não o `next start` padrão), que sobe um
servidor **HTTPS** com certificado autoassinado gerado automaticamente na
primeira execução (cobre `localhost` + os IPs de rede local detectados no
computador-servidor). Isso protege login/senha e dados de cliente
trafegando pela rede da loja — sem isso, um cookie de sessão ou uma senha
digitada em outro computador viajaria em texto puro até o servidor.

Cada computador vai ver um aviso de "conexão não é segura" no navegador na
primeira vez que acessar `https://<ip-do-servidor>:3000` — é esperado (é um
certificado autoassinado, sem custo, não veio de uma autoridade
certificadora pública), só precisa clicar em "Avançado" e depois em
"Continuar mesmo assim"/"Prosseguir" uma vez por navegador. O certificado
fica salvo em `internal-app/certs/` (fora do git — `.gitignore`) e é
regenerado automaticamente se o IP do servidor mudar.

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
  regra da Crislaine Santos — implementado e testado exatamente como fechado na
  especificação. Independe de qualquer banco.
- **Banco de dados próprio da aplicação** (SQLite, `lib/db/`): histórico de
  orçamentos, índice de busca de produtos (FTS5), configuração mensal de
  vendedores ativos e histórico de bonificação calculada.
- **Módulo Orçamento** ponta a ponta com dados de amostra: busca de
  produtos (full-text + dicionário de sinônimos), montagem do orçamento e
  geração de PDF replicando o modelo real usado na Construmix — logo
  oficial de verdade (`assets/logo-icone-construmix.png`, extraída do
  arquivo enviado pelo Marcos e embutida via `pdfDoc.embedPng`), dados do
  cliente, tabela de itens, desconto, forma de pagamento, assinatura,
  rodapé — com paginação real para orçamentos longos.
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
- **Comparativos entre empresas** (`/gestao/comparativos`): busca
  faturamento de pedidos das 3 empresas (`lib/postgres/faturamentoPorEmpresa.ts`,
  a mesma query da Construmix generalizada por empresa) e renderiza um
  gráfico comparativo + tabela + exportação PNG. Cada empresa/mês sem
  conexão configurada aparece como "não configurado" em vez de quebrar a
  tela — hoje mostra isso pras 3, porque nenhuma conexão real existe ainda.

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
   Relacionado: o faturamento de pedidos (pré-venda) já validado contra o
   relatório real do Zeus fica ~1,7% acima (ver
   `lib/postgres/faturamentoPorEmpresa.ts`) — resíduo ainda não investigado.
2. **Códigos de forma de pagamento por empresa.** SAMS e New House já têm
   acesso liberado e schema confirmado idêntico ao da Construmix (Marcos,
   2026-08), mas os códigos numéricos de forma de pagamento usados pra
   filtrar "venda de fato" (`FORMAS_PAGAMENTO_VALIDAS`) foram lidos só da
   tela da Construmix — ainda não confirmado se valem pras outras duas.

## Arquitetura

```
internal-app/
  app/
    gestao/
      login/            página de login (fora do grupo protegido)
      (protected)/       tudo que exige sessão: layout.tsx valida + nav;
                          painel, faturamento, vendedores, bonificação
                          (com BonusCharts.tsx), histórico de orçamentos,
                          comparativos (com ComparativoChart.tsx)
    orcamento/        módulo aberto (busca produtos, monta orçamento, gera PDF)
    api/               route handlers (auth, produtos/search, orcamento,
                        bonificacao/calcular, comparativos/faturamento)
  lib/
    bonus.ts           motor de cálculo da bonificação (puro, testado)
    auth.ts             sessão do módulo Gestão
    pdf.ts               geração de PDF do orçamento, replicando o modelo real
    db/                  banco próprio (SQLite): schema.sql + repositórios
    postgres/            conectores aos 3 bancos do Zeus, com as queries
                          reais de faturamento/cimento/catálogo já escritas
                          (faturamentoPorEmpresa.ts é genérica, usada tanto
                          pela bonificação da Construmix quanto pelos
                          comparativos entre as 3 empresas)
  data/mock-catalog.json amostra de produtos para dev (NÃO é o catálogo real)
  scripts/seed-catalog.ts carrega o catálogo de amostra no SQLite local
```

## Próximos passos (ordem sugerida)

App já instalado e rodando num computador real da loja, catálogo
sincronizado (~8.000 produtos), Faturamento Fiscal e faturamento de
pedidos validados contra relatórios reais do Zeus na Construmix, e acesso
liberado nos bancos de SAMS/New House (schema confirmado idêntico).

1. Validar o ABATIMENTO calculado contra a planilha META_2026 e ajustar a
   exclusão de cancelamentos/devoluções (ver pendência 1 acima).
2. Confirmar os códigos de forma de pagamento de SAMS/New House (pendência
   2 acima) e então validar `/gestao/comparativos` (fiscal e pré-venda)
   com números reais das 3 empresas.
3. Agendar a sincronização periódica do catálogo (hoje é sob demanda, via
   botão no Painel).
