-- Banco de dados próprio da aplicação (SQLite).
-- Não é o banco do Zeus: guarda histórico de orçamentos, índice de busca do
-- catálogo (sincronizado periodicamente do Zeus) e configuração/histórico
-- de bonificação.

CREATE TABLE IF NOT EXISTS vendedores_ativos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  vendedores_ativos INTEGER NOT NULL DEFAULT 0,
  observacao TEXT,
  UNIQUE (year, month)
);

CREATE TABLE IF NOT EXISTS abatimento_mensal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  faturamento_pedidos REAL NOT NULL,
  vendas_cimento REAL NOT NULL DEFAULT 0,
  abatimento REAL NOT NULL,
  origem TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'zeus-sync'
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (year, month)
);

CREATE TABLE IF NOT EXISTS bonificacao_calculada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  abatimento REAL NOT NULL,
  meta REAL,
  percentual_atingido REAL,
  multiplicador REAL NOT NULL,
  valor_total_bonus REAL NOT NULL,
  vendedores_ativos INTEGER NOT NULL,
  valor_por_vendedor REAL NOT NULL,
  valor_cris REAL NOT NULL,
  calculado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (year, month)
);

-- Índice de busca do catálogo de produtos, sincronizado periodicamente do
-- Zeus (ver lib/postgres/catalogSync.ts). FTS5 permite busca full-text
-- rápida sobre 6.000+ produtos sem sobrecarregar o Postgres de produção a
-- cada busca do balcão.
CREATE TABLE IF NOT EXISTS produtos (
  codigo TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  unidade TEXT,
  preco REAL NOT NULL DEFAULT 0,
  sincronizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS produtos_fts USING fts5(
  codigo UNINDEXED,
  nome,
  categoria,
  content=produtos,
  content_rowid=rowid
);

CREATE TRIGGER IF NOT EXISTS produtos_ai AFTER INSERT ON produtos BEGIN
  INSERT INTO produtos_fts(rowid, codigo, nome, categoria)
  VALUES (new.rowid, new.codigo, new.nome, new.categoria);
END;

CREATE TRIGGER IF NOT EXISTS produtos_ad AFTER DELETE ON produtos BEGIN
  INSERT INTO produtos_fts(produtos_fts, rowid, codigo, nome, categoria)
  VALUES ('delete', old.rowid, old.codigo, old.nome, old.categoria);
END;

CREATE TRIGGER IF NOT EXISTS produtos_au AFTER UPDATE ON produtos BEGIN
  INSERT INTO produtos_fts(produtos_fts, rowid, codigo, nome, categoria)
  VALUES ('delete', old.rowid, old.codigo, old.nome, old.categoria);
  INSERT INTO produtos_fts(rowid, codigo, nome, categoria)
  VALUES (new.rowid, new.codigo, new.nome, new.categoria);
END;

-- Dicionário de sinônimos alimentado pela loja (ex: "caixão" = "marco/batente")
-- para melhorar o matching do orçamento sem depender de busca semântica/IA.
CREATE TABLE IF NOT EXISTS sinonimos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  termo TEXT NOT NULL,
  sinonimo TEXT NOT NULL,
  UNIQUE (termo, sinonimo)
);

-- Cadastro simples de nomes dos vendedores, pra emitir recibo de
-- bonificação nominal (ver lib/recibo.ts). Não tem histórico por mês —
-- é sempre "quem está ativo agora"; ao gerar recibos de um mês passado,
-- confira se a lista bate com o número de vendedores lançado naquele mês.
CREATE TABLE IF NOT EXISTS vendedores_nomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Histórico de orçamentos gerados no balcão.
CREATE TABLE IF NOT EXISTS orcamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  vendedor TEXT,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_endereco TEXT,
  itens_json TEXT NOT NULL, -- [{codigo, nome, unidade, quantidade, precoUnitario}]
  desconto REAL NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  total REAL NOT NULL,
  observacoes TEXT
);
