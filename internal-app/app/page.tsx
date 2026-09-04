import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #0f5f1e 0%, #1a8a2e 45%, #17241a 100%)',
      }}
    >
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
        <div
          style={{
            width: 88,
            height: 88,
            margin: '0 auto 20px',
            background: '#fff',
            borderRadius: 20,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 12px 32px rgba(0,0,0,.25)',
          }}
        >
          <Image src="/logo-construmix.png" alt="Construmix" width={60} height={48} />
        </div>

        <h1 style={{ fontSize: 32, marginBottom: 6, color: '#fff', letterSpacing: -0.5 }}>
          Construmix
        </h1>
        <p style={{ color: 'rgba(255,255,255,.75)', marginBottom: 40, fontSize: 15 }}>
          Gestão &amp; Orçamento — integrado ao Zeus
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link
            href="/orcamento"
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '28px 20px',
              textDecoration: 'none',
              color: '#17241a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              transition: 'transform .15s ease',
            }}
          >
            <span style={{ fontSize: 32 }}>🧾</span>
            <strong style={{ fontSize: 16 }}>Orçamento</strong>
            <span style={{ fontSize: 12, color: '#667169' }}>Balcão — sem senha</span>
          </Link>

          <Link
            href="/gestao"
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '28px 20px',
              textDecoration: 'none',
              color: '#17241a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              transition: 'transform .15s ease',
            }}
          >
            <span style={{ fontSize: 32 }}>📊</span>
            <strong style={{ fontSize: 16 }}>Gestão</strong>
            <span style={{ fontSize: 12, color: '#667169' }}>Administração — com senha</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
