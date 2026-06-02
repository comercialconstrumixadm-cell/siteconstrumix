'use client';
import { useEffect, useRef } from 'react';
import { TruckIcon, PackageIcon, HomeIcon, ShieldIcon, MapPinIcon, ClockIcon, PhoneIcon, CheckIcon, ArrowIcon, WhatsAppIcon } from '@/components/Icons';
import { waLink } from '@/lib/data';
import { pixelContact, pixelButtonClick } from '@/lib/pixel';

function OpenBadge() {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const open = (day >= 1 && day <= 5 && h >= 7 && h < 18) || (day === 6 && h >= 7 && h < 13);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: open ? 'var(--green-50)' : '#fee2e2',
      color: open ? 'var(--green-800)' : '#991b1b',
      padding: '4px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 99,
        background: open ? 'var(--green-600)' : '#dc2626',
        animation: open ? 'fabPulse 2s infinite' : 'none',
      }} />
      {open ? 'Aberto agora' : 'Fechado'}
    </span>
  );
}

function StylizedMap() {
  return (
    <svg viewBox="0 0 700 520" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="parkPat" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#cfe5b8" />
          <circle cx="10" cy="10" r="3" fill="#a7cf85" />
        </pattern>
      </defs>
      <rect width="700" height="520" fill="#e9efd9" />
      <g fill="#f3f6e8">
        <rect x="20" y="20" width="200" height="140" rx="6" />
        <rect x="240" y="20" width="240" height="100" rx="6" />
        <rect x="500" y="20" width="180" height="160" rx="6" />
        <rect x="20" y="180" width="160" height="160" rx="6" />
        <rect x="200" y="140" width="280" height="120" rx="6" />
        <rect x="500" y="200" width="180" height="120" rx="6" />
        <rect x="20" y="360" width="220" height="140" rx="6" />
        <rect x="260" y="280" width="220" height="120" rx="6" />
        <rect x="260" y="420" width="220" height="80" rx="6" />
        <rect x="500" y="340" width="180" height="160" rx="6" />
      </g>
      <rect x="540" y="40" width="120" height="100" rx="8" fill="url(#parkPat)" />
      <path d="M-20 460 Q 100 440 200 460 T 400 470 T 720 450 L 720 540 L -20 540 Z" fill="#9ec9e8" />
      <path d="M-20 460 Q 100 440 200 460 T 400 470 T 720 450" stroke="#79b3d8" strokeWidth="2" fill="none" />
      <g fontFamily="Inter,sans-serif" fontSize="10" fill="#7a8a6b">
        <text x="240" y="135" letterSpacing=".05em">Rua Simeão Aguiar</text>
        <text x="40" y="175" letterSpacing=".05em">Rua Pacatuba</text>
        <text x="495" y="195" letterSpacing=".05em">Av. Maranhão</text>
        <text x="40" y="355" letterSpacing=".05em">Rua Riachuelo</text>
        <text x="495" y="335" letterSpacing=".05em">Rua João Pessoa</text>
      </g>
      <line x1="200" y1="130" x2="500" y2="130" stroke="#ffd400" strokeWidth="6" />
      <g transform="translate(360,116)">
        <circle r="38" fill="rgba(26,138,46,.18)">
          <animate attributeName="r" values="30;46;30" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".4;0;.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle r="22" fill="#1a8a2e" stroke="#fff" strokeWidth="4" />
        <path d="M0 -7 L0 7 M-7 0 L7 0" stroke="#fff" strokeWidth="3" />
        <path d="M-4 -3 L4 -3 L4 7 L0 4 L-4 7 Z" fill="#fff" />
      </g>
      <g transform="translate(360,166)">
        <rect x="-58" y="-2" width="116" height="22" rx="6" fill="#0d4a1a" />
        <text x="0" y="13" textAnchor="middle" fontFamily="Anton,sans-serif" fontSize="11" fill="#fff" letterSpacing=".06em">VOCÊ ESTÁ AQUI</text>
      </g>
      <g transform="translate(640,460)" opacity=".7">
        <circle r="20" fill="#fff" stroke="#c0d090" />
        <text x="0" y="-7" textAnchor="middle" fontFamily="Anton" fontSize="10" fill="#1a8a2e">N</text>
        <path d="M0 -3 L4 7 L0 4 L-4 7 Z" fill="#1a8a2e" />
      </g>
    </svg>
  );
}

function SergipeMap() {
  return (
    <svg viewBox="0 0 280 320" style={{ width: 280, height: 320 }}>
      <defs>
        <radialGradient id="radius" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,212,0,.3)" />
          <stop offset="100%" stopColor="rgba(255,212,0,0)" />
        </radialGradient>
      </defs>
      <path d="M70 30 L160 20 L210 50 L240 100 L235 160 L220 200 L200 250 L150 290 L110 280 L80 240 L50 180 L40 120 L55 70 Z"
        fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
      <circle cx="170" cy="220" r="110" fill="url(#radius)" />
      <circle cx="170" cy="220" r="110" fill="none" stroke="rgba(255,212,0,.5)" strokeDasharray="6 6" />
      {[
        { x: 170, y: 220, name: 'Aracaju', main: true },
        { x: 140, y: 180, name: 'N. Sra. do Socorro', main: false },
        { x: 120, y: 135, name: 'Itabaiana', main: false },
        { x: 100, y: 240, name: 'Lagarto', main: false },
        { x: 190, y: 140, name: 'Estância', main: false },
      ].map((c) => (
        <g key={c.name} transform={`translate(${c.x},${c.y})`}>
          <circle r={c.main ? 7 : 3.5} fill={c.main ? '#ffd400' : '#fff'}
            stroke={c.main ? '#0d4a1a' : 'rgba(255,255,255,.4)'} strokeWidth={c.main ? 2 : 1} />
          {c.main && (
            <circle r="14" fill="none" stroke="#ffd400" strokeWidth="2">
              <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values=".8;0;.8" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <text x={c.main ? 11 : 6} y="4" fontFamily="Inter" fontSize={c.main ? 13 : 10}
            fontWeight={c.main ? 700 : 500} fill="#fff">{c.name}</text>
        </g>
      ))}
      <text x="140" y="50" textAnchor="middle" fontFamily="Anton,sans-serif" fontSize="20"
        fill="rgba(255,255,255,.85)" letterSpacing=".06em">SERGIPE</text>
    </svg>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  lines: React.ReactNode[];
  cta?: { label: string; href: string; wa?: boolean };
  badge?: React.ReactNode;
}

function InfoCard({ icon: IconComp, title, lines, cta, badge }: InfoCardProps) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--green-50)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <IconComp width={22} height={22} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 22, letterSpacing: '.01em' }}>{title.toUpperCase()}</div>
            {badge}
          </div>
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
      {cta && (
        <a
          className={`btn ${cta.wa ? 'btn-wa' : 'btn-outline'}`}
          style={{ marginTop: 16, padding: '11px 14px', fontSize: 13 }}
          target="_blank" rel="noopener noreferrer" href={cta.href}
          onClick={() => cta.wa
            ? pixelContact()
            : pixelButtonClick(cta.label, `info_${title.toLowerCase()}`, cta.href)
          }
        >
          {cta.wa ? <WhatsAppIcon width={16} height={16} /> : null}
          {cta.label} {!cta.wa && <ArrowIcon width={14} height={14} />}
        </a>
      )}
    </div>
  );
}

export default function LocalizacaoPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!pageRef.current) return;

      ctx = gsap.context(() => {
        gsap.from('.loc-hero > *', {
          opacity: 0, y: 50, stagger: 0.15, duration: 0.7, ease: 'power3.out', delay: 0.1,
        });
        gsap.from('.map-block', {
          opacity: 0, x: -60, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.map-block', start: 'top 85%', once: true },
        });
        gsap.from('.info-cards > .card', {
          opacity: 0, x: 60, stagger: 0.15, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.info-cards', start: 'top 85%', once: true },
        });
        gsap.from('.how-card', {
          opacity: 0, y: 40, scale: 0.94, stagger: 0.1, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: '.how-grid', start: 'top 88%', once: true },
        });
        gsap.from('.delivery-content > *', {
          opacity: 0, y: 40, stagger: 0.12, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.delivery-section', start: 'top 85%', once: true },
        });
        gsap.from('.sergipe-map', {
          opacity: 0, scale: 0.7, rotate: -8, duration: 1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.delivery-section', start: 'top 85%', once: true },
        });
      }, pageRef.current);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section style={{ background: 'var(--green-800)', color: '#fff', padding: '56px 0 72px', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container loc-hero" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: '#fff', opacity: 0.85 }}>Onde nos encontrar</span>
          <h1 className="display" style={{ fontSize: 'clamp(44px,6vw,80px)', marginTop: 10, marginBottom: 14 }}>
            VEM PRA LOJA.<br />
            <span style={{ color: 'var(--yellow)' }}>A GENTE TE ESPERA.</span>
          </h1>
          <p style={{ maxWidth: 560, fontSize: 17, color: '#dff2e3' }}>
            Fica no <strong style={{ color: '#fff' }}>José Conrado de Araújo</strong>, em Aracaju.
            Estacionamento na porta, café no balcão e vendedor que entende de obra de verdade.
          </p>
        </div>
      </section>

      {/* Map + Info */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 32 }}>
            <div className="map-block" style={{
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)',
              minHeight: 520, position: 'relative', background: '#e6ecdb',
            }}>
              <StylizedMap />
              <div style={{
                position: 'absolute', top: 20, left: 20, right: 20,
                background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)',
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', gap: 14, alignItems: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,.10)',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--green-700)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <MapPinIcon width={22} height={22} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Comercial Construmix</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Rua Simeão Aguiar, 147 — José Conrado de Araújo, Aracaju/SE</div>
                </div>
                <a className="btn btn-primary" style={{ padding: '10px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
                  target="_blank" rel="noopener noreferrer"
                  href="https://www.google.com/maps/search/?api=1&query=Rua+Simeao+Aguiar+147+Aracaju+Jose+Conrado+Araujo">
                  Abrir no Maps <ArrowIcon width={14} height={14} />
                </a>
              </div>
            </div>
            <div className="info-cards" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InfoCard
                icon={MapPinIcon}
                title="Endereço"
                lines={[
                  <><strong>Rua Simeão Aguiar, 147</strong></>,
                  'Bairro José Conrado de Araújo',
                  'Aracaju — Sergipe • CEP 49085-000',
                ]}
                cta={{ label: 'Ver rotas', href: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Simeao+Aguiar+147+Aracaju+Jose+Conrado+Araujo' }}
              />
              <InfoCard
                icon={ClockIcon}
                title="Horário de funcionamento"
                lines={[
                  <><span style={{ color: 'var(--muted)' }}>Segunda à Sexta</span> &nbsp;<strong>7h às 18h</strong></>,
                  <><span style={{ color: 'var(--muted)' }}>Sábado</span> &nbsp;<strong>7h às 13h</strong></>,
                  <><span style={{ color: 'var(--muted)' }}>Domingo e feriado</span> &nbsp;<strong>Fechado</strong></>,
                ]}
                badge={<OpenBadge />}
              />
              <InfoCard
                icon={PhoneIcon}
                title="Telefone & WhatsApp"
                lines={[
                  <><strong>(79) 99919-6363</strong> &nbsp;<span style={{ color: 'var(--green-700)', fontSize: 12, fontWeight: 700 }}>• Atendimento rápido</span></>,
                  'contato@construmix.com.br',
                ]}
                cta={{ label: 'Chamar no WhatsApp', href: waLink('Olá! Vim pelo site e gostaria de ser atendido.'), wa: true }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Como chegar */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--line)' }} className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Como chegar</span>
            <h2 className="display" style={{ fontSize: 'clamp(32px,4.5vw,52px)' }}>FÁCIL DE CHEGAR.<br />FÁCIL DE LEVAR.</h2>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
            {[
              { I: TruckIcon, t: 'De carro', d: 'Estacionamento gratuito na porta. Pátio com espaço para caminhão e carga.' },
              { I: PackageIcon, t: 'De moto', d: 'Vaga coberta de moto. Carga rápida no balcão.' },
              { I: HomeIcon, t: 'De ônibus', d: 'Linhas 100, 102 e 305 param a uma quadra da loja.' },
              { I: ShieldIcon, t: 'Segurança', d: 'Bairro tranquilo, área monitorada e iluminada.' },
            ].map((c) => (
              <div key={c.t} className="how-card card">
                <div style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--green-50)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                  <c.I width={22} height={22} />
                </div>
                <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 22, letterSpacing: '.01em', marginBottom: 6 }}>{c.t.toUpperCase()}</div>
                <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery banner */}
      <section className="delivery-section section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--green-700), var(--green-900))',
            color: '#fff', borderRadius: 24, padding: '48px 56px',
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
            <div className="delivery-content" style={{ position: 'relative', zIndex: 2 }}>
              <span className="eyebrow" style={{ color: 'var(--yellow)' }}>Entrega rápida</span>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,46px)', marginTop: 10, marginBottom: 14 }}>
                ENTREGAMOS EM<br />TODA <span style={{ color: 'var(--yellow)' }}>SERGIPE.</span>
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Aracaju', 'Mesmo dia em pedidos até as 14h'],
                  ['Grande Aracaju', 'Entrega em até 24h'],
                  ['Interior de Sergipe', 'Em até 48h úteis'],
                  ['Retirada na loja', 'Pronto em até 30 min'],
                ].map(([l, d]) => (
                  <li key={l} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--yellow)', color: '#1a1a1a', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CheckIcon width={14} height={14} />
                    </span>
                    <span><strong>{l}</strong> <span style={{ color: '#dff2e3' }}>— {d}</span></span>
                  </li>
                ))}
              </ul>
              <a className="btn btn-yellow" target="_blank" rel="noopener noreferrer"
                href={waLink('Olá! Quero saber sobre prazo e frete pra minha cidade.')}
                onClick={() => pixelContact()}>
                <WhatsAppIcon /> CONSULTAR FRETE
              </a>
            </div>
            <div className="sergipe-map" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
              <SergipeMap />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
