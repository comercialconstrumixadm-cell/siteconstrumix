'use client';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, MapPinIcon, PhoneIcon, MailIcon, ClockIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <BrandLogo size={50} color="#fff" />
            <p className="small" style={{ marginTop: 16, maxWidth: 340, lineHeight: 1.6 }}>
              Do alicerce ao acabamento, a sua obra começa aqui. Atendimento raiz,
              variedade de verdade e entrega rápida em toda Aracaju e região.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <a href="https://wa.me/5579999196363" target="_blank" rel="noopener noreferrer"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1a2922', display: 'grid', placeItems: 'center', color: '#cfd6cf' }}>
                <WhatsAppIcon width={18} height={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1a2922', display: 'grid', placeItems: 'center', color: '#cfd6cf' }}>
                <InstagramIcon width={18} height={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#1a2922', display: 'grid', placeItems: 'center', color: '#cfd6cf' }}>
                <FacebookIcon width={18} height={18} />
              </a>
            </div>
          </div>
          <div>
            <h4>Navegue</h4>
            <ul>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/produtos">Produtos</Link></li>
              <li><Link href="/localizacao">Localização</Link></li>
              <li><Link href="/orcamento">Orçamento</Link></li>
            </ul>
          </div>
          <div>
            <h4>Categorias</h4>
            <ul>
              <li>Pisos e Revestimentos</li>
              <li>Portas e Madeiras</li>
              <li>Hidráulica e Elétrica</li>
              <li>Tintas e Acabamento</li>
              <li>Ferramentas e Metais</li>
            </ul>
          </div>
          <div>
            <h4>Contato</h4>
            <ul>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MapPinIcon width={16} height={16} style={{ marginTop: 2, color: 'var(--green-500)', flexShrink: 0 }} />
                Rua Simeão Aguiar, 147 — José Conrado de Araújo, Aracaju/SE
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <PhoneIcon width={16} height={16} style={{ color: 'var(--green-500)' }} />
                (79) 99919-6363
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <MailIcon width={16} height={16} style={{ color: 'var(--green-500)' }} />
                contato@construmix.com.br
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <ClockIcon width={16} height={16} style={{ marginTop: 2, color: 'var(--green-500)', flexShrink: 0 }} />
                Seg–Sex 7h–18h<br />Sábado 7h–13h
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <span>© 2026 Comercial Construmix — Todos os direitos reservados.</span>
          <span>Feito com 💚 em Aracaju/SE</span>
        </div>
      </div>
    </footer>
  );
}
