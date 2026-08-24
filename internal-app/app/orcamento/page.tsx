'use client';

import { useRef, useState } from 'react';

interface ProdutoBusca {
  codigo: string;
  nome: string;
  categoria: string | null;
  unidade: string | null;
  preco: number;
}

interface ItemCarrinho extends ProdutoBusca {
  quantidade: number;
  linhaOriginal?: string;
  candidatos?: ProdutoBusca[];
}

interface ItemNaoEncontrado {
  linhaOriginal: string;
  descricaoDetectada: string;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrcamentoPage() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ProdutoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [listaTexto, setListaTexto] = useState('');
  const [processandoLista, setProcessandoLista] = useState(false);
  const [processandoPdf, setProcessandoPdf] = useState(false);
  const [naoEncontrados, setNaoEncontrados] = useState<ItemNaoEncontrado[]>([]);
  const inputPdfRef = useRef<HTMLInputElement>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEndereco, setClienteEndereco] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [desconto, setDesconto] = useState('0');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
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

  function trocarProdutoItem(codigoAtual: string, novoProduto: ProdutoBusca) {
    setItens((atual) => {
      const item = atual.find((i) => i.codigo === codigoAtual);
      if (!item || novoProduto.codigo === codigoAtual) return atual;
      const semAtual = atual.filter((i) => i.codigo !== codigoAtual);
      const existenteNovo = semAtual.find((i) => i.codigo === novoProduto.codigo);
      if (existenteNovo) {
        return semAtual.map((i) =>
          i.codigo === novoProduto.codigo ? { ...i, quantidade: i.quantidade + item.quantidade } : i
        );
      }
      return [
        ...semAtual,
        { ...novoProduto, quantidade: item.quantidade, linhaOriginal: item.linhaOriginal, candidatos: item.candidatos },
      ];
    });
  }

  function aplicarItensMatch(itensMatch: {
    linhaOriginal: string;
    descricaoDetectada: string;
    quantidade: number;
    produto: ProdutoBusca | null;
    candidatos: ProdutoBusca[];
  }[]) {
    const semMatch: ItemNaoEncontrado[] = [];

    setItens((atual) => {
      let novos = [...atual];
      for (const item of itensMatch) {
        if (!item.produto) {
          semMatch.push({ linhaOriginal: item.linhaOriginal, descricaoDetectada: item.descricaoDetectada });
          continue;
        }
        const codigo = item.produto.codigo;
        const existente = novos.find((i) => i.codigo === codigo);
        if (existente) {
          novos = novos.map((i) => (i.codigo === codigo ? { ...i, quantidade: i.quantidade + item.quantidade } : i));
        } else {
          novos = [
            ...novos,
            { ...item.produto, quantidade: item.quantidade, linhaOriginal: item.linhaOriginal, candidatos: item.candidatos },
          ];
        }
      }
      return novos;
    });

    setNaoEncontrados(semMatch);
  }

  async function processarLista() {
    if (!listaTexto.trim()) return;
    setProcessandoLista(true);
    setNaoEncontrados([]);
    try {
      const res = await fetch('/api/produtos/match-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: listaTexto }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Falha ao processar a lista.');
        return;
      }
      aplicarItensMatch(data.itens ?? []);
      setListaTexto('');
    } finally {
      setProcessandoLista(false);
    }
  }

  async function processarPdf(arquivo: File) {
    setProcessandoPdf(true);
    setNaoEncontrados([]);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const res = await fetch('/api/produtos/match-lote-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Falha ao ler o PDF.');
        return;
      }
      aplicarItensMatch(data.itens ?? []);
    } finally {
      setProcessandoPdf(false);
      if (inputPdfRef.current) inputPdfRef.current.value = '';
    }
  }

  const subtotal = itens.reduce((soma, item) => soma + item.quantidade * item.preco, 0);
  const descontoNum = Math.max(0, Number(desconto) || 0);
  const total = Math.max(0, subtotal - descontoNum);

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
          clienteEndereco: clienteEndereco || undefined,
          desconto: descontoNum || undefined,
          formaPagamento: formaPagamento || undefined,
          itens: itens.map((i) => ({
            codigo: i.codigo,
            nome: i.nome,
            unidade: i.unidade ?? undefined,
            quantidade: i.quantidade,
            precoUnitario: i.preco,
          })),
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
        <h2 style={{ fontSize: 15, marginBottom: 4 }}>Colar ou enviar lista de itens</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
          Cole vários itens de uma vez, um por linha (ex: &quot;2 cimento CP2 50kg&quot;, &quot;telha x10&quot; ou só o
          nome), ou envie um PDF com a lista. O sistema tenta achar o produto e o código certo do Zeus sozinho —
          depois é só conferir e corrigir o que estiver errado.
        </p>
        <textarea
          value={listaTexto}
          onChange={(e) => setListaTexto(e.target.value)}
          placeholder={'2 cimento CP2 50kg\ntelha ondulada x10\nareia média'}
          rows={5}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: 8, marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={processarLista} disabled={processandoLista || !listaTexto.trim()}>
            {processandoLista ? 'Processando…' : 'Processar lista automaticamente'}
          </button>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>ou</span>
          <input
            ref={inputPdfRef}
            type="file"
            accept="application/pdf"
            disabled={processandoPdf}
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) processarPdf(arquivo);
            }}
          />
          {processandoPdf && <span style={{ color: 'var(--muted)', fontSize: 13 }}>Lendo PDF…</span>}
        </div>

        {naoEncontrados.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: '#fdecea',
              border: '1px solid #f3b4ac',
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              {naoEncontrados.length} item(ns) da lista não foram encontrados automaticamente:
            </p>
            <ul style={{ fontSize: 13, paddingLeft: 18 }}>
              {naoEncontrados.map((n, i) => (
                <li key={i}>
                  &quot;{n.linhaOriginal}&quot; — busque manualmente abaixo e adicione, se existir no catálogo.
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
              <th>Cód. Zeus</th>
              <th>Qtd.</th>
              <th>Unit.</th>
              <th>Total</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.codigo}>
                <td>
                  {item.nome}
                  {item.linhaOriginal && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>da lista: &quot;{item.linhaOriginal}&quot;</div>
                  )}
                </td>
                <td style={{ color: 'var(--muted)' }}>{item.codigo}</td>
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
                  {item.candidatos && item.candidatos.length > 1 && (
                    <select
                      value={item.codigo}
                      onChange={(e) => {
                        const escolhido = item.candidatos?.find((c) => c.codigo === e.target.value);
                        if (escolhido) trocarProdutoItem(item.codigo, escolhido);
                      }}
                      style={{ fontSize: 12 }}
                    >
                      {item.candidatos.map((c) => (
                        <option key={c.codigo} value={c.codigo}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => removerItem(item.codigo)}>Remover</button>
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: 'var(--muted)' }}>Nenhum item adicionado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          {descontoNum > 0 && (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Subtotal: {brl(subtotal)}</p>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Desconto: −{brl(descontoNum)}</p>
            </>
          )}
          <p style={{ fontWeight: 700 }}>Total: {brl(total)}</p>
        </div>
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
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Endereço (opcional)</label>
            <input value={clienteEndereco} onChange={(e) => setClienteEndereco(e.target.value)} />
          </div>
          <div className="field">
            <label>Desconto (R$)</label>
            <input type="number" min={0} step="0.01" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
          </div>
          <div className="field">
            <label>Forma de pagamento</label>
            <input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} />
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
