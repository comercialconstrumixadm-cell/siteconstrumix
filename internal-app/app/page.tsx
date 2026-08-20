import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Construmix — Gestão &amp; Orçamento</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
          App interno, integrado ao Zeus. Uso nos computadores da loja.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/orcamento" className="btn">
            Módulo Orçamento
          </Link>
          <Link href="/gestao" className="btn btn-secondary">
            Módulo Gestão
          </Link>
        </div>
      </div>
    </main>
  );
}
