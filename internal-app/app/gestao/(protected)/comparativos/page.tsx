export default function ComparativosPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Comparativos entre empresas</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 640 }}>
        Construmix x SAMS x New House, lado a lado, e comparativos mês a mês / ano a ano.
      </p>
      <div className="card">
        <p>
          Bloqueado até as 3 conexões PostgreSQL (uma por empresa) estarem configuradas com
          credenciais reais e os números validados — ver <code>.env.example</code> e{' '}
          <code>lib/postgres/config.ts</code>. É um único servidor Postgres, na rede local da
          loja, com um banco por empresa (<code>base_construmix</code>,{' '}
          <code>base_samscomercio</code>, <code>base_newhouse</code>); o app mantém 3 conexões
          separadas e agrega os dados nesta camada.
        </p>
        <p style={{ marginTop: 12 }}>
          Quando os 3 bancos estiverem acessíveis, esta tela deve consultar faturamento por
          empresa/mês (via módulos equivalentes a <code>lib/postgres/construmixFaturamento.ts</code>
          para SAMS e New House) e renderizar os gráficos de crescimento/faturamento com
          exportação em PDF/imagem, para uso em reunião mensal e prestação de contas.
        </p>
      </div>
    </div>
  );
}
