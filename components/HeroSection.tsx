'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Mascot from './Mascot';
import { WhatsAppIcon, ArrowIcon, CheckIcon, StarIcon } from './Icons';
import { waLink } from '@/lib/data';

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const gsap = (await import('gsap')).default;
      if (!heroRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.5 })
          .from('.hero-title', { opacity: 0, y: 60, duration: 0.8, skewY: 2 }, '-=0.2')
          .from('.hero-sub', { opacity: 0, y: 30, duration: 0.6 }, '-=0.4')
          .from('.hero-cta-row > *', { opacity: 0, y: 20, duration: 0.5, stagger: 0.12 }, '-=0.3')
          .from('.hero-trust > *', { opacity: 0, x: -20, duration: 0.4, stagger: 0.1 }, '-=0.2')
          .from('.hero-mascot', { opacity: 0, x: 80, duration: 0.9, ease: 'power2.out' }, '-=0.7')
          .from('.hero-sticker-1', { opacity: 0, rotate: -20, scale: 0.6, duration: 0.5 }, '-=0.3')
          .from('.hero-sticker-2', { opacity: 0, rotate: 12, scale: 0.6, duration: 0.5 }, '-=0.3');

        // floating mascot
        gsap.to('.hero-mascot', {
          y: -14,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        // sticker wiggle
        gsap.to('.hero-sticker-1', {
          rotate: -4,
          duration: 2.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }, heroRef.current);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg,#1a8a2e 0%,#0f6b22 50%,#0d4a1a 100%)',
        color: '#fff',
        overflow: 'hidden',
        padding: '88px 0 100px',
      }}
    >
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', top: 60, right: -40, width: 340, height: 520, opacity: 0.18, zIndex: 1 }} viewBox="0 0 340 520">
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={20 + c * 52} cy={20 + r * 52} r="16" fill="none" stroke="#fff" strokeWidth="3" />
          ))
        )}
      </svg>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .9fr', gap: 48, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <span className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)',
              fontSize: 13, fontWeight: 600, letterSpacing: '.04em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--yellow)' }} />
              Aracaju/SE • Atendimento físico e online
            </span>
            <h1 className="hero-title display" style={{
              fontSize: 'clamp(48px,7vw,96px)',
              lineHeight: 0.92, margin: '18px 0 22px',
              textTransform: 'uppercase',
              textShadow: '0 4px 24px rgba(0,0,0,.25)',
            }}>
              Sua obra<br />
              <span style={{ color: 'var(--yellow)' }}>do alicerce</span><br />
              ao acabamento.
            </h1>
            <p className="hero-sub" style={{ fontSize: 19, lineHeight: 1.55, color: '#dff2e3', maxWidth: 540, marginBottom: 32 }}>
              Pisos, portas, hidráulica, elétrica, tintas, ferramentas, metais e madeiras —
              <strong style={{ color: '#fff' }}> tudo em um só lugar</strong>, com preço bom, atendimento raiz
              e entrega rápida em todo Sergipe.
            </p>
            <div className="hero-cta-row" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a className="btn btn-yellow btn-lg" target="_blank" rel="noopener noreferrer"
                href={waLink('Olá! Quero fazer um orçamento rápido pelo WhatsApp.')}>
                <WhatsAppIcon /> ORÇAMENTO NO ZAP
              </a>
              <Link className="btn btn-outline btn-lg" href="/produtos"
                style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
                Ver Produtos <ArrowIcon />
              </Link>
            </div>
            <div className="hero-trust" style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap', color: '#cfeed5', fontSize: 14 }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckIcon width={18} height={18} style={{ color: 'var(--yellow)' }} /> Entrega em todo Sergipe
              </span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckIcon width={18} height={18} style={{ color: 'var(--yellow)' }} /> Retirada na loja
              </span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckIcon width={18} height={18} style={{ color: 'var(--yellow)' }} /> Parcelamento facilitado
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <div style={{
              position: 'absolute', width: 380, height: 380,
              background: 'radial-gradient(circle, rgba(255,212,0,.25), transparent 70%)',
              top: '10%',
            }} />
            <div className="hero-mascot">
              <Mascot height={460} />
            </div>
            <div className="hero-sticker-1" style={{
              position: 'absolute', top: 30, left: 0,
              background: 'var(--yellow)', color: '#1a1a1a',
              padding: '14px 20px', borderRadius: 14,
              fontFamily: "'Anton',sans-serif",
              fontSize: 22, letterSpacing: '.02em',
              transform: 'rotate(-6deg)',
              boxShadow: '0 14px 30px rgba(0,0,0,.25)',
            }}>
              ATÉ <span style={{ color: 'var(--green-800)' }}>15X</span> NO CARTÃO
            </div>
            <div className="hero-sticker-2" style={{
              position: 'absolute', bottom: 60, right: -20,
              background: '#fff', color: 'var(--ink)',
              padding: '14px 18px', borderRadius: 14,
              display: 'flex', gap: 10, alignItems: 'center',
              boxShadow: '0 14px 30px rgba(0,0,0,.25)',
              transform: 'rotate(4deg)',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#d97706' }}>
                <StarIcon width={20} height={20} />
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>+10 mil clientes</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>satisfeitos na região</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
