'use client';

import { useState } from 'react';

interface ProdutoBusca {
  codigo: string;
  nome: string;
  categoria: string | null;
  unidade: string | null;
  preco: number;
}

interface ItemCarrinho extends ProdutoBusca {
  quantidade: number;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrcamentoPage() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ProdutoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [gerando, setGerando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function buscar(q: string) {
    setTermo(q);
    if (!q.trim()) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    try {
      const res = await fetch(`/api/produtos/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResultados(data.produtos ?? []);
    } finally {
      setBuscando(false);
    }
  }

  function adicionarItem(produto: ProdutoBusca) {
    setItens((atual) => {
      const existente = atual.find((i) => i.codigo === produto.codigo);
      if (existente) {
        return atual.map((i) => (i.codigo === produto.codigo ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [...atual, { ...produto, quantidade: 1 }];
    });
  }

  function alterarQuantidade(codigo: string, quantidade: number) {
    setItens((atual) => atual.map((i) => (i.codigo === codigo ? { ...i, quantidade: Math.max(1, quantidade) } : i)));
  }

  function removerItem(codigo: string) {
    setItens((atual) => atual.filter((i) => i.codigo !== codigo));
  }

  const total = itens.reduce((soma, item) => soma + item.quantidade * item.preco, 0);

  async function gerarOrcamento() {
    setGerando(true);
    setPdfUrl(null);
    try {
      const res = await fetch('/api/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor: vendedor || undefined,
          clienteNome: clienteNome || undefined,
          clienteTelefone: clienteTelefone || undefined,
          itens: itens.map((i) => ({ codigo: i.codigo, nome: i.nome, quantidade: i.quantidade, precoUnitario: i.preco })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha ao gerar orçamento.');

      const bytes = Uint8Array.from(atob(data.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } finally {
      setGerando(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>Orçamento</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Digite o que o cliente pediu (ex: &quot;porta pintada branca&quot;) e escolha o produto certo.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Buscar produto</label>
          <input
            value={termo}
            onChange={(e) => buscar(e.target.value)}
            placeholder="ex: porta pintada, cimento, torneira…"
            autoFocus
          />
        </div>
        {buscando && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Buscando…</p>}
        {resultados.length > 0 && (
          <table>
            <tbody>
              {resultados.map((p) => (
                <tr key={p.codigo}>
                  <td>{p.nome}</td>
                  <td style={{ color: 'var(--muted)' }}>{p.categoria}</td>
                  <td>{brl(p.preco)}{p.unidade ? `/${p.unidade}` : ''}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => adicionarItem(p)}>Adicionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {termo && !buscando && resultados.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhum produto encontrado para &quot;{termo}&quot;.</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Itens do orçamento</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd.</th>
              <th>Unit.</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.codigo}>
                <td>{item.nome}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) => alterarQuantidade(item.codigo, Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                </td>
                <td>{brl(item.preco)}</td>
                <td>{brl(item.preco * item.quantidade)}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => removerItem(item.codigo)}>Remover</button>
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--muted)' }}>Nenhum item adicionado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p style={{ textAlign: 'right', fontWeight: 700, marginTop: 12 }}>Total: {brl(total)}</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Dados do orçamento</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Vendedor</label>
            <input value={vendedor} onChange={(e) => setVendedor(e.target.value)} />
          </div>
          <div className="field">
            <label>Cliente</label>
            <input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} />
          </div>
        </div>
        <button className="btn" disabled={itens.length === 0 || gerando} onClick={gerarOrcamento}>
          {gerando ? 'Gerando…' : 'Gerar PDF'}
        </button>
      </div>

      {pdfUrl && (
        <div className="card">
          <p style={{ marginBottom: 12 }}>Orçamento gerado.</p>
          <a className="btn" href={pdfUrl} download="orcamento.pdf">Baixar PDF</a>
        </div>
      )}
    </main>
  );
}
