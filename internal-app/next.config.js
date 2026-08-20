/** @type {import('next').NextConfig} */
const nextConfig = {
  // App interno (rodando nos PCs da loja): precisa de servidor Node para
  // acessar SQLite local e os bancos Firebird do Zeus, então NÃO usa
  // `output: 'export'` (diferente do site institucional estático).
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
