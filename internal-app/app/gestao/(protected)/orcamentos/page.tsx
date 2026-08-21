import { listOrcamentos } from '@/lib/db/orcamentos';
import type { ItemOrcamento } from '@/lib/db/orcamentos';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HistoricoOrcamentosPage() {
  const orcamentos = listOrcamentos(100) as any[];

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Histórico de orçamentos</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
        Orçamentos gerados no balcão (módulo aberto <code>/orcamento</code>), guardados no
        banco próprio da aplicação.
      </p>

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
                  <td>{o.clienteNome ?? '—'}</td>
                  <td>{itens.length}</td>
                  <td>{brl(o.total)}</td>
                </tr>
              );
            })}
            {orcamentos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)' }}>Nenhum orçamento gerado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
