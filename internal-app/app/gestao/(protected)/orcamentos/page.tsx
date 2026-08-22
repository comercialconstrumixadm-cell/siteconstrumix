import { listOrcamentos } from '@/lib/db/orcamentos';
import type { ItemOrcamento } from '@/lib/db/orcamentos';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HistoricoOrcamentosPage({
  searchParams,
}: {
  searchParams: { cliente?: string; de?: string; ate?: string };
}) {
  const cliente = searchParams.cliente?.trim() ?? '';
  const de = searchParams.de ?? '';
  const ate = searchParams.ate ?? '';

  const orcamentos = listOrcamentos({
    clienteNome: cliente || undefined,
    dataInicio: de || undefined,
    dataFim: ate || undefined,
    limite: 200,
  }) as any[];

  const temFiltro = Boolean(cliente || de || ate);

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Histórico de orçamentos</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
        Orçamentos gerados no balcão (módulo aberto <code>/orcamento</code>), guardados no
        banco próprio da aplicação. Ficam salvos aqui indefinidamente — não há apagamento
        automático.
      </p>

      <form method="get" className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div className="field">
            <label>Nome do cliente</label>
            <input type="text" name="cliente" defaultValue={cliente} placeholder="ex: João" />
          </div>
          <div className="field">
            <label>De</label>
            <input type="date" name="de" defaultValue={de} />
          </div>
          <div className="field">
            <label>Até</label>
            <input type="date" name="ate" defaultValue={ate} />
          </div>
          <button className="btn" type="submit">Buscar</button>
        </div>
        {temFiltro && (
          <p style={{ marginTop: 8 }}>
            <a href="/gestao/orcamentos" style={{ fontSize: 13 }}>Limpar filtros</a>
          </p>
        )}
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Vendedor</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.map((o) => {
              const itens = JSON.parse(o.itensJson) as ItemOrcamento[];
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{new Date(o.criadoEm).toLocaleString('pt-BR')}</td>
                  <td>{o.vendedor ?? '—'}</td>
                  <td>{o.clienteNome ?? 'Ao consumidor'}</td>
                  <td>{itens.length}</td>
                  <td>{brl(o.total)}</td>
                </tr>
              );
            })}
            {orcamentos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)' }}>
                  {temFiltro ? 'Nenhum orçamento encontrado com esses filtros.' : 'Nenhum orçamento gerado ainda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
