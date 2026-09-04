import Link from 'next/link';
import Image from 'next/image';

export default function OrcamentoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
          <Image src="/logo-construmix.png" alt="Construmix" width={28} height={22} />
          <strong style={{ fontSize: 15 }}>Construmix</strong>
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <nav style={{ display: 'flex', gap: 4 }}>
          <Link href="/orcamento" style={tabStyle}>Novo orçamento</Link>
          <Link href="/orcamento/historico" style={tabStyle}>Histórico</Link>
        </nav>
        <Link href="/" style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Início
        </Link>
      </header>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

const tabStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  fontSize: 14,
  color: 'var(--ink)',
  textDecoration: 'none',
};
