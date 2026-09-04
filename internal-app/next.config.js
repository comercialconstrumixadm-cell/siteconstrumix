/** @type {import('next').NextConfig} */
const nextConfig = {
  // App interno (rodando nos PCs da loja): precisa de servidor Node para
  // acessar SQLite local e os bancos Firebird do Zeus, então NÃO usa
  // `output: 'export'` (diferente do site institucional estático).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // pdf-parse (extração de texto de PDF colado no Orçamento) carrega um
  // arquivo worker (.mjs) num caminho relativo ao próprio pacote em tempo
  // de execução — se o webpack empacota o pacote dentro do bundle da
  // rota, esse arquivo não é encontrado. Mantendo como pacote externo, a
  // rota carrega ele direto do node_modules (onde o worker está do lado).
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

module.exports = nextConfig;
