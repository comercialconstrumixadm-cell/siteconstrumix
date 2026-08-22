'use client';

import { useState } from 'react';

export default function SincronizarCatalogoButton() {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function sincronizar() {
    setCarregando(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/catalogo/sincronizar', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMensagem(`Erro: ${data.error}`);
        return;
      }
      setMensagem(`${data.total} produtos sincronizados.`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <button className="btn" onClick={sincronizar} disabled={carregando}>
        {carregando ? 'Sincronizando…' : 'Sincronizar catálogo agora'}
      </button>
      {mensagem && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{mensagem}</p>}
    </div>
  );
}
