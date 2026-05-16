'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import Mascot from '@/components/Mascot';
import ProductCard from '@/components/ProductCard';
import {
  TruckIcon, PackageIcon, WalletIcon, ShieldIcon, CheckIcon,
  ArrowIcon, WhatsAppIcon, DocIcon, StarIcon, GridIcon,
} from '@/components/Icons';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, waLink } from '@/lib/data';

/* ─── Strip items for infinite marquee ─── */
const STRIP_ITEMS = [
  { Icon: TruckIcon, text: 'Entrega em todo Sergipe' },
  { Icon: PackageIcon, text: 'Retirada na loja' },
  { Icon: WalletIcon, text: 'Parcele em até 15x' },
  { Icon: ShieldIcon, text: 'Atendimento raiz' },
  { Icon: StarIcon, text: '4.9★ no Google' },
  { Icon: CheckIcon, text: 'Mais de 5.000 itens' },
  { Icon: GridIcon, text: 'Do alicerce ao acabamento' },
];

/* ─── Como Funciona steps ─── */
const STEPS = [
  {
    num: '01',
    title: 'Escolha seus produtos',
    desc: 'Navegue pelo catálogo online ou venha pessoalmente. São mais de 5.000 itens disponíveis para pronta entrega.',
    Icon: GridIcon,
    color: 'var(--green-700)',
    bg: 'var(--green-50)',
  },
  {
    num: '02',
    title: 'Fale com a gente',
    desc: 'Entre em contato pelo WhatsApp ou pessoalmente. Nossos vendedores te orientam na melhor escolha, sem enrolação.',
    Icon: WhatsAppIcon,
    color: '#1fbf5b',
    bg: '#e6fbee',
  },
  {
    num: '03',
    title: 'Receba ou retire',
    desc: 'Entregamos em Aracaju no mesmo dia e no interior em até 48h. Ou retire na loja quando quiser, sem complicação.',
    Icon: TruckIcon,
    color: '#2563eb',
    bg: '#eff4ff',
  },
];

/* ─── Why stats ─── */
const STATS = [
  { value: '+10K', label: 'Clientes atendidos', pct: 92 },
  { value: '4.9★', label: 'Avaliação Google', pct: 98 },
  { value: '+5K', label: 'Itens em estoque', pct: 85 },
  { value: '2 dias', label: 'Entrega no interior', pct: 75 },
];

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  /* ─── Category card tilt ─── */
  const catGridRef = useRef<HTMLDivElement>(null);

  /* ─── Testimonials marquee direction ─── */
  const [pauseMarquee, setPauseMarquee] = useState(false);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!pageRef.current) return;

      ctx = gsap.context(() => {

        /* ── Strip eyebrow ── */
        gsap.from('.strip-eyebrow', {
          opacity: 0, y: 20, duration: 0.5,
          scrollTrigger: { trigger: '.strip-eyebrow', start: 'top 90%', once: true },
        });

        /* ── Category section ── */
        gsap.from('.cat-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.cat-head', start: 'top 88%', once: true },
        });
        gsap.from('.cat-card', {
          opacity: 0, y: 50, scale: 0.92, stagger: 0.07, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: '.cat-grid', start: 'top 88%', once: true },
        });

        /* ── Steps section ── */
        gsap.from('.steps-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.steps-head', start: 'top 88%', once: true },
        });
        gsap.from('.step-card', {
          opacity: 0, y: 60, scale: 0.94, stagger: 0.14, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.steps-grid', start: 'top 86%', once: true },
        });
        gsap.from('.step-connector', {
          scaleX: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out',
          transformOrigin: 'left',
          scrollTrigger: { trigger: '.steps-grid', start: 'top 80%', once: true },
        });

        /* ── Promo strip ── */
        gsap.from('.promo-content > *', {
          opacity: 0, x: -30, stagger: 0.1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.promo-strip', start: 'top 88%', once: true },
        });

        /* ── Products ── */
        gsap.from('.products-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.products-head', start: 'top 88%', once: true },
        });
        gsap.from('.product-card-item', {
          opacity: 0, y: 60, stagger: 0.09, duration: 0.58, ease: 'power2.out',
          scrollTrigger: { trigger: '.products-grid', start: 'top 90%', once: true },
        });

        /* ── Why section ── */
        gsap.from('.why-left', {
          opacity: 0, x: -64, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 80%', once: true },
        });
        gsap.from('.why-right', {
          opacity: 0, x: 64, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 80%', once: true },
        });
        gsap.from('.why-item', {
          opacity: 0, x: -28, stagger: 0.12, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: '.why-list', start: 'top 88%', once: true },
        });

        /* ── Stats counters ── */
        const counters: Array<{ el: string; end: number; fmt: (v: number) => string }> = [
          { el: '.stat-10k', end: 10000, fmt: (v) => '+' + Math.round(v / 1000) + 'K' },
          { el: '.stat-49', end: 4.9, fmt: (v) => v.toFixed(1) + '★' },
          { el: '.stat-5k', end: 5000, fmt: (v) => '+' + Math.round(v / 1000) + 'K' },
        ];
        counters.forEach(({ el, end, fmt }) => {
          document.querySelectorAll<HTMLElement>(el).forEach((element) => {
            ScrollTrigger.create({
              trigger: element, start: 'top 90%', once: true,
              onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: end, duration: 1.6, ease: 'power2.out',
                  onUpdate: () => { element.textContent = fmt(obj.val); },
                });
              },
            });
          });
        });

        /* ── Stats progress bars ── */
        document.querySelectorAll<HTMLElement>('.prog-bar-fill').forEach((bar) => {
          const pct = bar.dataset.pct || '0';
          ScrollTrigger.create({
            trigger: bar, start: 'top 90%', once: true,
            onEnter: () => {
              gsap.to(bar, {
                scaleX: parseFloat(pct) / 100,
                duration: 1.2, ease: 'power2.out', delay: 0.1,
              });
            },
          });
        });

        /* ── Testimonials head ── */
        gsap.from('.testimonials-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.testimonials-head', start: 'top 88%', once: true },
        });

        /* ── Final CTA ── */
        gsap.from('.cta-final > *', {
          opacity: 0, y: 40, stagger: 0.14, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.cta-final', start: 'top 86%', once: true },
        });

      }, pageRef.current);

      /* ── Category card 3D tilt ── */
      if (catGridRef.current) {
        const cards = catGridRef.current.querySelectorAll<HTMLElement>('.cat-card');
        cards.forEach((card) => {
          const onEnter = () => gsap.to(card, { scale: 1.03, duration: 0.25, ease: 'power2.out', boxShadow: '0 18px 40px rgba(13,74,26,.18)' });
          const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: 'power3.out', boxShadow: '' });
          const onMove = (e: MouseEvent) => {
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
            const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
            gsap.to(card, {
              rotateY: x * 8, rotateX: -y * 8,
              duration: 0.35, ease: 'power2.out',
              transformPerspective: 900,
            });
          };
          card.addEventListener('mouseenter', onEnter);
          card.addEventListener('mouseleave', onLeave);
          card.addEventListener('mousemove', onMove);
        });
      }
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <HeroSection />

      {/* ═══ Infinite marquee strip ═══ */}
      <div
        className="marquee-wrap"
        style={{ background: 'var(--ink)', padding: '18px 0', borderBottom: '1px solid #1c2920' }}
      >
        <div className="marquee-track" style={{ whiteSpace: 'nowrap' }}>
          {[...STRIP_ITEMS, ...STRIP_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '0 40px', color: '#cfd6cf', fontSize: 14, fontWeight: 600,
              }}
            >
              <item.Icon width={17} height={17} style={{ color: 'var(--green-500)', flexShrink: 0 }} />
              {item.text}
              <span style={{ marginLeft: 40, color: '#2d4a33' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ Categorias ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-head cat-head">
            <span className="eyebrow">Categorias</span>
            <h2 className="display">
              Tudo pra sua obra<br />
              <span style={{ color: 'var(--green-700)' }}>em um só lugar.</span>
            </h2>
            <p>Do tijolo à tinta. Mais de 5.000 itens em estoque com pronta entrega.</p>
          </div>

          <div
            className="cat-grid"
            ref={catGridRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/produtos?cat=${cat.slug}`}
                className="cat-card tilt-card card"
                style={{
                  textAlign: 'left', display: 'flex', flexDirection: 'column',
                  gap: 14, padding: 24, minHeight: 200,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  width: 54, height: 54, borderRadius: 14,
                  background: `linear-gradient(135deg, ${cat.color1}, ${cat.color2})`,
                  color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 15, letterSpacing: '.04em' }}>
                    {cat.title.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Anton',sans-serif", fontSize: 22,
                    letterSpacing: '.01em', textTransform: 'uppercase', lineHeight: 1.05,
                  }}>
                    {cat.title}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>{cat.tagline}</div>
                </div>
                <div style={{
                  marginTop: 'auto', display: 'flex', alignItems: 'center',
                  gap: 6, color: 'var(--green-700)', fontWeight: 700, fontSize: 13,
                }}>
                  Ver produtos <ArrowIcon width={14} height={14} />
                </div>
                {/* Decorative bg glyph */}
                <div style={{
                  position: 'absolute', bottom: -10, right: -6,
                  fontFamily: "'Anton',sans-serif", fontSize: 80, opacity: 0.04,
                  color: 'var(--ink)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {cat.title.slice(0, 3).toUpperCase()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Como Funciona ═══ */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head steps-head center" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', alignItems: 'center' }}>
            <span className="eyebrow">Simples assim</span>
            <h2 className="display">
              Como comprar<br />
              <span style={{ color: 'var(--green-700)' }}>na Construmix</span>
            </h2>
          </div>

          <div
            className="steps-grid"
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 24, position: 'relative',
            }}
          >
            {/* Connecting lines */}
            <div
              className="step-connector"
              style={{
                position: 'absolute', top: 44, left: 'calc(33.33% - 12px)',
                width: 'calc(33.33% + 24px - 32px)', height: 2,
                background: 'linear-gradient(90deg, var(--green-700), var(--green-500))',
                borderRadius: 99, transformOrigin: 'left',
              }}
            />
            <div
              className="step-connector"
              style={{
                position: 'absolute', top: 44, left: 'calc(66.66% - 12px)',
                width: 'calc(33.33% + 24px - 32px)', height: 2,
                background: 'linear-gradient(90deg, var(--green-500), #2563eb)',
                borderRadius: 99, transformOrigin: 'left',
              }}
            />

            {STEPS.map((step) => (
              <div
                key={step.num}
                className="step-card card"
                style={{ padding: 32, position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16, marginBottom: 20,
                  background: step.bg, display: 'grid', placeItems: 'center',
                  color: step.color,
                }}>
                  <step.Icon width={26} height={26} />
                </div>
                <div style={{
                  fontFamily: "'Anton',sans-serif",
                  fontSize: 14, letterSpacing: '.12em',
                  color: step.color, marginBottom: 8,
                }}>
                  PASSO {step.num}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, lineHeight: 1.2 }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
                {/* Background number */}
                <div style={{
                  position: 'absolute', top: -14, right: 12,
                  fontFamily: "'Anton',sans-serif", fontSize: 88,
                  color: 'var(--green-50)', lineHeight: 1,
                  userSelect: 'none', pointerEvents: 'none',
                }}>
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Promo strip ═══ */}
      <section
        className="promo-strip"
        style={{
          background: 'linear-gradient(92deg, var(--yellow) 0%, #ffdc2b 100%)',
          padding: '28px 0', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Shine decoration */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.3) 50%, transparent 100%)',
          animation: 'shimmer 4s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div
          className="container promo-content"
          style={{
            display: 'flex', gap: 24, alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap',
            position: 'relative', zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              fontFamily: "'Anton',sans-serif", fontSize: 58,
              color: 'var(--green-800)', lineHeight: 0.9,
            }}>
              15%
            </div>
            <div>
              <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 24, letterSpacing: '.02em' }}>
                OFF NA PRIMEIRA COMPRA
              </div>
              <div style={{ fontSize: 14, color: '#5a4a00' }}>
                Cupom <strong>OBRA15</strong> · Válido para compras acima de R$ 300
              </div>
            </div>
          </div>
          <a
            className="btn btn-primary btn-lg"
            target="_blank" rel="noopener noreferrer"
            href={waLink('Olá! Quero usar o cupom OBRA15 e fazer meu primeiro pedido.')}
          >
            <WhatsAppIcon /> PEGAR DESCONTO
          </a>
        </div>
      </section>

      {/* ═══ Destaques da semana ═══ */}
      <section className="section">
        <div className="container">
          <div
            className="products-head"
            style={{
              display: 'flex', flexDirection: 'row',
              justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32,
              flexWrap: 'wrap', gap: 16,
            }}
          >
            <div>
              <span className="eyebrow">Destaques da semana</span>
              <h2 className="display" style={{ fontSize: 'clamp(32px,4.5vw,52px)', marginTop: 8 }}>
                OFERTAS QUE<br />VALEM A OBRA.
              </h2>
            </div>
            <Link className="btn btn-outline" href="/produtos">
              Ver todos <ArrowIcon />
            </Link>
          </div>

          <div
            className="products-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}
          >
            {PRODUCTS.slice(0, 4).map((p) => (
              <div key={p.id} className="product-card-item">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Por que escolher ═══ */}
      <section
        className="why-section section"
        style={{ background: '#fff', borderTop: '1px solid var(--line)' }}
      >
        <div className="container">
          <div
            className="why-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}
          >
            {/* Left */}
            <div className="why-left">
              <span className="eyebrow">Por que Construmix</span>
              <h2
                className="display"
                style={{ fontSize: 'clamp(36px,5vw,60px)', margin: '12px 0 24px' }}
              >
                A LOJA QUE{' '}
                <span style={{ color: 'var(--green-700)' }}>RESOLVE</span>
                <br />SUA OBRA.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 30 }}>
                Tem medo de comprar errado? De atrasar a obra? De pagar caro? Aqui o atendimento
                é diferente: nossos vendedores são gente da construção que te orientam de verdade.
              </p>

              <div className="why-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { t: 'Variedade real', d: 'Mais de 5.000 itens em estoque, do alicerce ao acabamento.', pct: 95 },
                  { t: 'Preço justo', d: 'Comparamos com o mercado todo mês pra manter o melhor custo-benefício.', pct: 88 },
                  { t: 'Entrega rápida', d: 'Em Aracaju no mesmo dia. Interior em até 48h.', pct: 90 },
                  { t: 'Atendimento humano', d: 'Vendedor de verdade no WhatsApp, sem robô te enrolando.', pct: 98 },
                ].map(({ t, d, pct }) => (
                  <div key={t} className="why-item">
                    <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, background: 'var(--green-50)',
                        color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2,
                      }}>
                        <CheckIcon width={16} height={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 15 }}>{t}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{d}</div>
                      </div>
                    </div>
                    <div className="prog-bar" style={{ marginLeft: 44 }}>
                      <div
                        className="prog-bar-fill"
                        data-pct={pct}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Mascot card */}
            <div className="why-right" style={{ position: 'relative' }}>
              <div style={{
                aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--green-700), var(--green-900))',
                position: 'relative', boxShadow: '0 32px 64px rgba(13,74,26,.32)',
              }}>
                <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.38 }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Mascot height={500} pose="arms" />
                </div>
                <div style={{ position: 'absolute', top: 28, left: 28, right: 28, color: '#fff' }}>
                  <div style={{
                    fontFamily: "'Anton',sans-serif", fontSize: 40,
                    lineHeight: 0.95, textTransform: 'uppercase',
                  }}>
                    Vendedor de verdade.
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.82, fontSize: 14 }}>
                    Te ajuda a escolher certo da primeira vez.
                  </div>
                </div>
              </div>

              {/* Stats floating card */}
              <div style={{
                position: 'absolute', bottom: -28, left: -28,
                background: '#fff', borderRadius: 18, padding: 22,
                boxShadow: '0 22px 44px rgba(13,74,26,.22)',
                border: '1px solid var(--line)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, minWidth: 260,
              }}>
                {STATS.slice(0, 2).map(({ value, label, pct }) => {
                  const cls = value.startsWith('+10') ? 'stat-10k'
                    : value.startsWith('4.9') ? 'stat-49' : 'stat-5k';
                  return (
                    <div key={label}>
                      <div
                        className={cls}
                        style={{ fontFamily: "'Anton',sans-serif", fontSize: 32, color: 'var(--green-700)', lineHeight: 1 }}
                      >
                        {value}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
                      <div className="prog-bar">
                        <div className="prog-bar-fill" data-pct={pct} style={{ width: '100%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats bar ═══ */}
      <section
        className="stats-bar section-tight"
        style={{
          background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-700) 100%)',
          color: '#fff',
        }}
      >
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: 32, textAlign: 'center',
          }}>
            {STATS.map(({ value, label, pct }) => {
              const cls = value.startsWith('+10') ? 'stat-10k'
                : value.startsWith('4.9') ? 'stat-49'
                : value.startsWith('+5') ? 'stat-5k' : '';
              return (
                <div key={label}>
                  <div
                    className={cls}
                    style={{
                      fontFamily: "'Anton',sans-serif", fontSize: 46,
                      lineHeight: 1, marginBottom: 6,
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginBottom: 12 }}>{label}</div>
                  <div className="prog-bar" style={{ background: 'rgba(255,255,255,.2)', maxWidth: 120, margin: '0 auto' }}>
                    <div
                      className="prog-bar-fill"
                      data-pct={pct}
                      style={{ width: '100%', background: 'var(--yellow)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Depoimentos — marquee carousel ═══ */}
      <section className="section" style={{ background: 'var(--bg)', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-head testimonials-head center" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', alignItems: 'center' }}>
            <span className="eyebrow">Quem comprou aprovou</span>
            <h2 className="display">
              O QUE FALAM<br />
              <span style={{ color: 'var(--green-700)' }}>POR AÍ DA GENTE.</span>
            </h2>
          </div>
        </div>

        {/* Infinite testimonials marquee — outside container for full bleed */}
        <div
          className="testimonials-marquee"
          style={{ cursor: 'grab' }}
          onMouseEnter={() => setPauseMarquee(true)}
          onMouseLeave={() => setPauseMarquee(false)}
        >
          <div
            className="marquee-track"
            style={{
              padding: '8px 0 24px',
              animationDuration: '34s',
              animationPlayState: pauseMarquee ? 'paused' : 'running',
              gap: 20,
            }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="card"
                style={{ width: 340, flexShrink: 0, padding: 26 }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 14, color: '#fbbf24' }}>
                  {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} width={16} height={16} />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 18, minHeight: 72 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--green-700)', color: '#fff',
                    display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA final ═══ */}
      <section
        className="cta-gradient"
        style={{ color: '#fff', padding: '80px 0', position: 'relative', overflow: 'hidden' }}
      >
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,212,0,.15), transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,197,71,.18), transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="container cta-final" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Pronto para começar?</span>
          <h2
            className="display"
            style={{ fontSize: 'clamp(36px,5.5vw,68px)', margin: '16px 0 18px' }}
          >
            BORA TIRAR ESSA<br />
            <span style={{ color: 'var(--yellow)' }}>OBRA DO PAPEL?</span>
          </h2>
          <p style={{ maxWidth: 540, margin: '0 auto 36px', color: 'rgba(255,255,255,.78)', fontSize: 17, lineHeight: 1.58 }}>
            Manda sua lista no WhatsApp ou faz um orçamento aqui no site. A gente responde
            rápido e ainda te ajuda a escolher o que combina melhor com sua obra.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              className="btn btn-wa btn-lg"
              target="_blank" rel="noopener noreferrer"
              href={waLink('Olá! Quero fazer um orçamento rápido.')}
            >
              <WhatsAppIcon /> CHAMAR NO WHATSAPP
            </a>
            <Link className="btn btn-yellow btn-lg" href="/orcamento">
              <DocIcon /> FAZER ORÇAMENTO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
