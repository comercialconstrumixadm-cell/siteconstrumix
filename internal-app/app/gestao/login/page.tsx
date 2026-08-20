'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error ?? 'Não foi possível entrar.');
        return;
      }
      router.push(params.get('from') || '/gestao');
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 360, width: '100%' }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>Módulo Gestão</h1>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {erro && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>{erro}</p>}
        <button type="submit" className="btn" disabled={carregando} style={{ width: '100%', justifyContent: 'center' }}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
