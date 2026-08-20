import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/auth';

export default async function GestaoLayout({ children }: { children: React.ReactNode }) {
  // O middleware já bloqueia sem cookie; aqui validamos a assinatura/expiração de verdade.
  const autenticado = await requireSession();
  if (!autenticado) {
    redirect('/gestao/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <nav
        style={{
          width: 220,
          background: '#0f5f1e',
          color: '#fff',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <strong style={{ marginBottom: 16 }}>Gestão Construmix</strong>
        <Link href="/gestao" style={navLinkStyle}>Painel</Link>
        <Link href="/gestao/faturamento" style={navLinkStyle}>Faturamento</Link>
        <Link href="/gestao/vendedores" style={navLinkStyle}>Vendedores ativos</Link>
        <Link href="/gestao/bonificacao" style={navLinkStyle}>Bonificação</Link>
        <Link href="/gestao/comparativos" style={navLinkStyle}>Comparativos</Link>
        <form action="/api/auth/logout" method="post" style={{ marginTop: 'auto' }}>
          <button
            type="submit"
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', width: '100%' }}
          >
            Sair
          </button>
        </form>
      </nav>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  padding: '8px 10px',
  borderRadius: 6,
  fontSize: 14,
};
