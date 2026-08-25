// Servidor HTTPS customizado.
//
// O app roda na rede da loja (vários computadores acessando o mesmo
// servidor), não só localhost — sem HTTPS, login/senha e dados de cliente
// trafegam em texto puro na rede (ver o bug do cookie "Secure" que quebrou
// o login pela rede quando ainda era HTTP puro). Um certificado real (tipo
// Let's Encrypt) exige domínio público, o que não existe aqui; por isso
// geramos um certificado autoassinado localmente, cobrindo "localhost" e os
// IPs da rede local detectados na máquina do servidor. Cada computador vai
// ver um aviso de "conexão não seguer" na primeira vez que acessar — é
// esperado para certificado autoassinado, só precisa clicar em "Avançado" >
// "Continuar mesmo assim" uma vez.
//
// Usa a lib "selfsigned" (puro JS) em vez de depender de OpenSSL instalado
// no Windows.
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const os = require('os');
const path = require('path');
const fs = require('fs');
const selfsigned = require('selfsigned');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

const CERT_DIR = path.join(process.cwd(), 'certs');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const HOSTS_PATH = path.join(CERT_DIR, 'hosts.json');

function getLanIps() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

function certificadoCobreHosts(hosts) {
  if (!fs.existsSync(HOSTS_PATH)) return false;
  try {
    const salvos = JSON.parse(fs.readFileSync(HOSTS_PATH, 'utf-8'));
    return hosts.every((h) => salvos.includes(h));
  } catch {
    return false;
  }
}

// A partir da v5, selfsigned.generate() é assíncrono (retorna Promise).
async function gerarCertificado(hosts) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
  const attrs = [{ name: 'commonName', value: 'gestao-construmix.local' }];
  const altNames = hosts.map((h) =>
    /^\d+\.\d+\.\d+\.\d+$/.test(h) ? { type: 7, ip: h } : { type: 2, value: h }
  );
  const pems = await selfsigned.generate(attrs, {
    days: 3650,
    keySize: 2048,
    extensions: [{ name: 'subjectAltName', altNames }],
  });
  fs.writeFileSync(CERT_PATH, pems.cert);
  fs.writeFileSync(KEY_PATH, pems.private);
  fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts));
}

// Regenera o certificado se ele ainda não existir ou se o IP do servidor na
// rede mudou (ex: trocou de roteador) e o certificado antigo não cobre mais
// o IP atual.
async function garantirCertificado() {
  const hosts = ['localhost', '127.0.0.1', ...getLanIps()];
  if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH) || !certificadoCobreHosts(hosts)) {
    console.log('[https] Gerando certificado autoassinado para: ' + hosts.join(', '));
    await gerarCertificado(hosts);
  }
  return { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CERT_PATH) };
}

app.prepare().then(async () => {
  const httpsOptions = await garantirCertificado();

  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Servidor HTTPS rodando na porta ${port}`);
    console.log(`> Acesse neste computador: https://localhost:${port}`);
    for (const ip of getLanIps()) {
      console.log(`> Acesse de outro computador da loja: https://${ip}:${port}`);
    }
    console.log(
      '> No primeiro acesso de cada computador, o navegador vai avisar que a conexão não é segura ' +
        '(normal para certificado autoassinado, sem custo) — clique em "Avançado" e depois em ' +
        '"Continuar mesmo assim"/"Prosseguir". Isso só aparece uma vez por computador/navegador.'
    );
  });
}).catch((erro) => {
  console.error('[https] Falha ao iniciar o servidor:', erro);
  process.exit(1);
});
