'use client';

import { useEffect, useState } from 'react';
import ComparativoChart from './ComparativoChart';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const NOME_EMPRESA: Record<string, string> = {
  construmix: 'Construmix',
  sams: 'SAMS',
  newhouse: 'New House',
};

interface FaturamentoMensalEmpresa {
  empresa: 'construmix' | 'sams' | 'newhouse';
  year: number;
  month: number;
  erro?: string;
  faturamento?: number;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ComparativosPage() {
  const [resultado, setResultado] = useState<FaturamentoMensalEmpresa[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch('/api/comparativos/faturamento');
      const data = await res.json();
      if (res.ok) setResultado(data.resultado);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const todasSemDados = !carregando && resultado.length > 0 && resultado.every((r) => r.erro);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Comparativos entre empresas</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
            Construmix x SAMS x New House, faturamento de pedidos lado a lado, últimos 6 meses.
          </p>
        </div>
        <button className="btn" onClick={carregar} disabled={carregando}>
          {carregando ? 'Carregando…' : 'Atualizar'}
        </button>
      </div>

      {!carregando && todasSemDados && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p>
            Nenhuma das 3 conexões PostgreSQL está configurada ainda — ver <code>.env.example</code> e{' '}
            <code>lib/postgres/config.ts</code>. É um único servidor Postgres, na rede local da loja, com
            um banco por empresa (<code>base_construmix</code>, <code>base_samscomercio</code>,{' '}
            <code>base_newhouse</code>); o app mantém 3 conexões separadas e agrega os dados nesta camada.
          </p>
        </div>
      )}

      <ComparativoChart dados={resultado} />

      {!carregando && resultado.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Mês</th>
                <th>Faturamento de pedidos</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r) => (
                <tr key={`${r.empresa}-${r.year}-${r.month}`}>
                  <td>{NOME_EMPRESA[r.empresa]}</td>
                  <td>{MESES[r.month - 1]}/{r.year}</td>
                  <td>{r.erro ? <span style={{ color: 'var(--muted)' }}>não configurado</span> : brl(r.faturamento ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
