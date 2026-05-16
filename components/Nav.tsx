'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';
import { HomeIcon, GridIcon, MapPinIcon, DocIcon, WhatsAppIcon, MenuIcon, CloseIcon } from './Icons';
import { waLink } from '@/lib/data';

const links = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/produtos', label: 'Produtos', Icon: GridIcon },
  { to: '/localizacao', label: 'Localização', Icon: MapPinIcon },
  { to: '/orcamento', label: 'Orçamento', Icon: DocIcon },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${compact ? ' nav-compact' : ''}`}>
      <div className="container nav-row">
        <Link href="/" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`nav-link ${pathname === l.to ? 'active' : ''}`}
            >
              <l.Icon width={16} height={16} />
              {l.label}
            </Link>
          ))}
          <a
            className="nav-cta"
            target="_blank"
            rel="noopener noreferrer"
            href={waLink('Olá! Vim pelo site da Construmix e gostaria de tirar uma dúvida.')}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
        </nav>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--line)', background: '#fff', padding: '12px 18px' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', padding: '14px 8px', gap: 10, fontWeight: 600,
                color: pathname === l.to ? 'var(--green-700)' : 'var(--ink)',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <l.Icon width={18} height={18} />
              {l.label}
            </Link>
          ))}
          <a
            className="btn btn-wa"
            style={{ marginTop: 14, width: '100%' }}
            target="_blank"
            rel="noopener noreferrer"
            href={waLink('Olá! Vim pelo site da Construmix.')}
          >
            <WhatsAppIcon /> Chamar no WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
