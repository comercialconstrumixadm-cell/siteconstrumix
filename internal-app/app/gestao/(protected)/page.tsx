import { listAbatimentoMensal } from '@/lib/db/abatimento';
import { listBonusHistorico } from '@/lib/db/bonusHistory';
import { countProdutos } from '@/lib/db/catalog';
import SincronizarCatalogoButton from './SincronizarCatalogoButton';

export default function PainelPage() {
  const abatimentos = listAbatimentoMensal();
  const bonusHistorico = listBonusHistorico() as any[];
  const totalProdutos = countProdutos();

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Painel</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Visão geral. Comparativos entre empresas e dashboards visuais exportáveis (PDF/imagem)
        entram aqui assim que os 3 bancos PostgreSQL do Zeus estiverem ligados e validados.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Meses de ABATIMENTO cadastrados</h2>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-700)' }}>{abatimentos.length}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Cadastrados manualmente em Faturamento até a sincronização automática com o Zeus estar pronta.
          </p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Bonificações calculadas</h2>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-700)' }}>{bonusHistorico.length}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ver histórico completo em Bonificação.</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Catálogo de produtos (Orçamento)</h2>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-700)' }}>{totalProdutos}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
            Produtos indexados pra busca no módulo Orçamento (só Construmix). Sincroniza sob
            demanda por enquanto — sem rotina automática agendada ainda.
          </p>
          <SincronizarCatalogoButton />
        </div>
      </div>
    </div>
  );
}
