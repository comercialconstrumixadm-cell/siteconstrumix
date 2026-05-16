'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Mascot from './Mascot';
import { WhatsAppIcon, ArrowIcon, CheckIcon } from './Icons';
import { waLink } from '@/lib/data';

const TITLE_LINES = [
  { text: 'Sua obra', yellow: false },
  { text: 'do alicerce', yellow: true },
  { text: 'ao acabamento.', yellow: false },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!heroRef.current) return;

      ctx = gsap.context(() => {
        // Background orbs entrance
        gsap.from('.hero-orb', {
          scale: 0, opacity: 0, stagger: 0.25, duration: 2,
          ease: 'power2.out',
        });

        // Main entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.5 }, 0.25)
          .from('.hero-char', {
            y: '120%', opacity: 0,
            stagger: { amount: 0.48, from: 'start' },
            duration: 0.52,
          }, 0.4)
          .from('.hero-sub', { opacity: 0, y: 24, duration: 0.6 }, 0.78)
          .from('.hero-cta-row > *', {
            opacity: 0, y: 16, scale: 0.95, stagger: 0.1, duration: 0.48,
          }, 0.9)
          .from('.hero-trust-item', {
            opacity: 0, x: -16, stagger: 0.08, duration: 0.4,
          }, 1.0)
          .from('.hero-right', {
            opacity: 0, x: 64, duration: 0.95, ease: 'power2.out',
          }, 0.5)
          .from('.hero-sticker-1', {
            opacity: 0, rotate: -28, scale: 0.45, duration: 0.6, ease: 'back.out(2.2)',
          }, 0.95)
          .from('.hero-sticker-2', {
            opacity: 0, rotate: 22, scale: 0.45, duration: 0.6, ease: 'back.out(2.2)',
          }, 1.08);

        // Ongoing loops
        gsap.to('.hero-mascot-float', {
          y: -18, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1,
        });
        gsap.to('.hero-sticker-1', {
          rotate: -8, y: -5, duration: 2.9, ease: 'sine.inOut',
          yoyo: true, repeat: -1, delay: 1.8,
        });
        gsap.to('.hero-sticker-2', {
          rotate: 9, y: 5, duration: 3.3, ease: 'sine.inOut',
          yoyo: true, repeat: -1, delay: 2.2,
        });
        gsap.to('.hero-orb-1', {
          scale: 1.28, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
        });
        gsap.to('.hero-orb-2', {
          scale: 1.2, duration: 6.8, ease: 'sine.inOut',
          yoyo: true, repeat: -1, delay: 1.4,
        });

        // Scroll parallax — background layer
        gsap.to('.hero-bg-layer', {
          y: '30%', ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });

        // Scroll parallax — mascot panel
        gsap.to('.hero-right', {
          y: '14%', ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.9,
          },
        });

        // Mouse glow tracking
        const onMove = (e: MouseEvent) => {
          const r = heroRef.current!.getBoundingClientRect();
          gsap.to('.hero-mouse-glow', {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
            duration: 0.9, ease: 'power2.out',
          });
        };
        heroRef.current!.addEventListener('mousemove', onMove);
        return () => heroRef.current?.removeEventListener('mousemove', onMove);
      }, heroRef.current);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(140deg, #1d9634 0%, #0f6b22 42%, #0a3d18 100%)',
        color: '#fff', padding: '92px 0 116px',
      }}
    >
      {/* Parallax background layer */}
      <div className="hero-bg-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.42 }} />

        <div className="hero-orb hero-orb-1" style={{
          position: 'absolute', top: -100, right: -80,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,212,0,.22) 0%, transparent 65%)',
        }} />
        <div className="hero-orb hero-orb-2" style={{
          position: 'absolute', bottom: -130, left: -90,
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,197,71,.24) 0%, transparent 65%)',
        }} />
        <div className="hero-orb" style={{
          position: 'absolute', top: '40%', left: '38%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 65%)',
        }} />

        <svg
          style={{ position: 'absolute', top: 44, right: 16, opacity: 0.1, width: 300, height: 460 }}
          viewBox="0 0 300 460"
        >
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={22 + c * 54} cy={22 + r * 54} r="18"
                fill="none" stroke="#fff" strokeWidth="2.5" />
            ))
          )}
        </svg>
      </div>

      {/* Mouse glow */}
      <div
        className="hero-mouse-glow"
        style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 1,
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,212,0,.1) 0%, transparent 68%)',
          top: 0, left: 0, transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          className="hero-grid"
          style={{ display: 'grid', gridTemplateColumns: '1.18fr 0.9fr', gap: 56, alignItems: 'center' }}
        >
          {/* LEFT */}
          <div>
            <div
              className="hero-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '8px 16px', borderRadius: 99,
                background: 'rgba(255,255,255,.11)', border: '1px solid rgba(255,255,255,.2)',
                fontSize: 12, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)',
                animation: 'dotPulse 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
              Aracaju/SE · Atendimento físico e online
            </div>

            <h1
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(46px, 7vw, 96px)',
                lineHeight: 0.94, margin: '22px 0 26px',
                textTransform: 'uppercase',
                textShadow: '0 4px 28px rgba(0,0,0,.18)',
              }}
            >
              {TITLE_LINES.map((line, li) => (
                <div
                  key={li}
                  style={{ overflow: 'hidden', display: 'block', paddingBottom: '0.06em' }}
                >
                  {line.text.split('').map((char, ci) => (
                    <span
                      key={`${li}-${ci}`}
                      className="hero-char"
                      style={{
                        display: 'inline-block', whiteSpace: 'pre',
                        color: line.yellow ? 'var(--yellow)' : '#fff',
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              ))}
            </h1>

            <p
              className="hero-sub"
              style={{ fontSize: 17, lineHeight: 1.64, color: '#d6ecdd', maxWidth: 510, marginBottom: 34 }}
            >
              Pisos, portas, hidráulica, elétrica, tintas, ferramentas, metais e madeiras —{' '}
              <strong style={{ color: '#fff' }}>tudo em um só lugar</strong>, com preço bom,
              atendimento raiz e entrega rápida em todo Sergipe.
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 34 }}>
              <a
                className="btn btn-yellow btn-lg"
                target="_blank" rel="noopener noreferrer"
                href={waLink('Olá! Quero fazer um orçamento rápido pelo WhatsApp.')}
              >
                <WhatsAppIcon /> ORÇAMENTO NO ZAP
              </a>
              <Link
                href="/produtos"
                className="btn btn-lg"
                style={{
                  background: 'rgba(255,255,255,.09)', color: '#fff',
                  border: '1.5px solid rgba(255,255,255,.26)',
                }}
              >
                Ver Produtos <ArrowIcon />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', color: '#c2e6ca', fontSize: 13 }}>
              {['Entrega em todo Sergipe', 'Retirada na loja', 'Parcele em até 15x'].map((t) => (
                <span
                  key={t}
                  className="hero-trust-item"
                  style={{ display: 'flex', gap: 7, alignItems: 'center' }}
                >
                  <CheckIcon width={15} height={15} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Mascot */}
          <div
            className="hero-right"
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
          >
            <div style={{
              position: 'absolute', width: 340, height: 340, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,212,0,.22), transparent 68%)',
              bottom: '6%', left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }} />

            <div className="hero-mascot-float">
              <Mascot height={468} />
            </div>

            {/* Sticker 1 */}
            <div
              className="hero-sticker-1"
              style={{
                position: 'absolute', top: 22, left: -16,
                background: 'var(--yellow)', color: '#1a1a1a',
                padding: '12px 18px', borderRadius: 12,
                fontFamily: "'Anton',sans-serif", fontSize: 20,
                letterSpacing: '.02em',
                boxShadow: '0 14px 32px rgba(0,0,0,.3)', zIndex: 3,
              }}
            >
              ATÉ <span style={{ color: 'var(--green-800)' }}>15X</span> NO CARTÃO
            </div>

            {/* Sticker 2 */}
            <div
              className="hero-sticker-2"
              style={{
                position: 'absolute', bottom: 72, right: -24,
                background: '#fff', color: 'var(--ink)',
                padding: '12px 16px', borderRadius: 12,
                display: 'flex', gap: 10, alignItems: 'center',
                boxShadow: '0 14px 32px rgba(0,0,0,.3)', zIndex: 3,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#fef3c7', display: 'grid', placeItems: 'center',
                color: '#d97706', fontSize: 22, lineHeight: 1,
              }}>
                ★
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>+10 mil clientes</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>satisfeitos na região</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: 0.38, pointerEvents: 'none',
      }}>
        <div style={{
          width: 1.5, height: 44, background: '#fff',
          animation: 'scrollLine 2.2s ease-in-out infinite',
        }} />
      </div>
    </section>
  );
}
