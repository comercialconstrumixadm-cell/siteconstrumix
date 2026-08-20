# Gestão + Orçamento Construmix (integrado ao Zeus)

App interno (não é o site institucional), rodando nos computadores fixos da
loja, com dois módulos:

- **`/gestao`** — protegido por senha (`GESTAO_PASSWORD`). Faturamento,
  vendedores ativos, bonificação e comparativos entre empresas.
- **`/orcamento`** — aberto, sem login, uso pelos vendedores no balcão.

Este diretório é uma aplicação Next.js **separada** do site institucional
que vive na raiz do repositório (`siteconstrumix`). O site institucional é
exportado como HTML estático (`output: 'export'`) e não tem servidor; este
app precisa de servidor Node (SQLite local + conexões Firebird), então foi
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
  geração de PDF.
- **Login do módulo Gestão** (senha + cookie de sessão assinado).

## O que está deliberadamente pendente (precisa de informação/acesso que só o Marcos tem)

Estes itens não podem ser implementados de forma confiável sem os dados
reais — foram deixados como stubs claramente marcados no código, em vez de
lógica adivinhada que poderia gerar números errados de bonificação ou
orçamentos incorretos:

1. **Credenciais dos 3 bancos Firebird do Zeus** (Construmix, SAMS, New
   House — mesma máquina, um `.fdb` cada). Preencher em `.env.local`
   (ver `.env.example`). Sem isso, `lib/firebird/client.ts` lança erro
   explicando o que falta.
2. **Qual tabela/view do Zeus é o relatório "faturamento de pedidos"** da
   Construmix (diferente do faturamento por NF) —
   `lib/firebird/construmixFaturamento.ts` tem a query como placeholder.
   Até isso ser resolvido, o faturamento mensal é lançado manualmente em
   `/gestao/faturamento`.
3. **Como isolar vendas de cimento** (categoria, CEST, código de produto?)
   — `lib/firebird/cimentoFilter.ts`.
4. **Schema real de produtos no Zeus** (nomes de tabela/coluna variam por
   instalação) — `lib/firebird/catalogSync.ts` tem uma query placeholder
   assumindo colunas `CODIGO/DESCRICAO/CATEGORIA/UNIDADE/PRECO`.
5. **Modelo visual do PDF de orçamento já usado na Construmix** — `lib/pdf.ts`
   gera um layout funcional simples que precisa ser substituído pelo
   modelo real (cores, logo, cabeçalho/rodapé) quando o Marcos compartilhar
   o exemplo.
6. **Comparativos entre empresas e dashboards exportáveis** (`/gestao/comparativos`)
   — dependem dos 3 bancos conectados; hoje é uma tela explicando o bloqueio.

## Arquitetura

```
internal-app/
  app/
    gestao/          módulo protegido (layout valida sessão + middleware.ts)
    orcamento/        módulo aberto (busca produtos, monta orçamento, gera PDF)
    api/               route handlers (auth, produtos/search, orcamento, bonificacao/calcular)
  lib/
    bonus.ts           motor de cálculo da bonificação (puro, testado)
    auth.ts             sessão do módulo Gestão
    pdf.ts               geração de PDF do orçamento
    db/                  banco próprio (SQLite): schema.sql + repositórios
    firebird/            conectores aos 3 bancos do Zeus (stubs documentados)
  data/mock-catalog.json amostra de produtos para dev (NÃO é o catálogo real)
  scripts/seed-catalog.ts carrega o catálogo de amostra no SQLite local
```

## Próximos passos (ordem sugerida)

1. Marcos traz: credenciais dos 3 Firebird + qual relatório é
   "faturamento de pedidos" + como identificar cimento + modelo do PDF.
2. Inspecionar o schema real de cada banco antes de trocar qualquer query
   placeholder (nomes de tabela podem variar entre as 3 instalações).
3. Ligar `lib/firebird/construmixFaturamento.ts` e `cimentoFilter.ts` de
   verdade e validar o ABATIMENTO calculado contra a planilha META_2026.
4. Ligar `lib/firebird/catalogSync.ts` com o schema real e agendar a
   sincronização periódica do catálogo (6.000+ produtos).
5. Substituir o layout de `lib/pdf.ts` pelo modelo real da Construmix.
6. Implementar `/gestao/comparativos` com os 3 bancos conectados.
