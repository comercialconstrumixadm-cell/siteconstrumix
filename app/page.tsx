'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import Mascot from '@/components/Mascot';
import ProductCard from '@/components/ProductCard';
import {
  TruckIcon, PackageIcon, WalletIcon, ShieldIcon, CheckIcon,
  ArrowIcon, WhatsAppIcon, DocIcon, StarIcon,
} from '@/components/Icons';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, waLink } from '@/lib/data';

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!pageRef.current) return;

      ctx = gsap.context(() => {
        // Strip differentials
        gsap.from('.strip-item', {
          opacity: 0, y: 30, stagger: 0.12, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.strip-section', start: 'top 88%', once: true },
        });

        // Category section heading
        gsap.from('.cat-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.cat-head', start: 'top 88%', once: true },
        });

        // Category cards stagger
        gsap.from('.cat-card', {
          opacity: 0, y: 50, scale: 0.94, stagger: 0.08, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: '.cat-grid', start: 'top 88%', once: true },
        });

        // Promo strip
        gsap.from('.promo-content > *', {
          opacity: 0, x: -30, stagger: 0.1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.promo-strip', start: 'top 88%', once: true },
        });

        // Products heading
        gsap.from('.products-head', {
          opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.products-head', start: 'top 88%', once: true },
        });

        // Product cards
        gsap.from('.product-card-item', {
          opacity: 0, y: 60, stagger: 0.1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.products-grid', start: 'top 90%', once: true },
        });

        // Why section
        gsap.from('.why-left', {
          opacity: 0, x: -60, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 80%', once: true },
        });
        gsap.from('.why-right', {
          opacity: 0, x: 60, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-section', start: 'top 80%', once: true },
        });
        gsap.from('.why-item', {
          opacity: 0, x: -30, stagger: 0.12, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: '.why-list', start: 'top 88%', once: true },
        });

        // Stats counter animation
        const counters = [
          { el: '.stat-10k', end: 10000, suffix: '+', prefix: '' },
          { el: '.stat-49', end: 4.9, suffix: '★', prefix: '' },
        ];
        counters.forEach(({ el, end, suffix }) => {
          const elements = document.querySelectorAll<HTMLElement>(el);
          elements.forEach((element) => {
            ScrollTrigger.create({
              trigger: element,
              start: 'top 90%',
              once: true,
              onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: end,
                  duration: 1.5,
                  ease: 'power2.out',
                  onUpdate: () => {
                    element.textContent = (end >= 100
                      ? '+' + Math.round(obj.val / 1000) + 'K'
                      : obj.val.toFixed(1) + suffix);
                  },
                });
              },
            });
          });
        });

        // Testimonials
        gsap.from('.testimonial-card', {
          opacity: 0, y: 50, scale: 0.95, stagger: 0.15, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.testimonials-grid', start: 'top 88%', once: true },
        });

        // Final CTA
        gsap.from('.cta-final > *', {
          opacity: 0, y: 40, stagger: 0.15, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.cta-final', start: 'top 85%', once: true },
        });
      }, pageRef.current);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <HeroSection />

      {/* Strip — diferenciais */}
      <section className="strip-section" style={{ background: 'var(--ink)', color: '#fff', padding: '28px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { I: TruckIcon, t: 'Entrega em todo Sergipe', s: 'Pedidos despachados rápido' },
            { I: PackageIcon, t: 'Retirada na loja', s: 'Pronta entrega em estoque' },
            { I: WalletIcon, t: 'Parcele em até 15x', s: 'No cartão de crédito' },
            { I: ShieldIcon, t: 'Atendimento raiz', s: 'Te ajudamos a escolher certo' },
          ].map((d, i) => (
            <div key={i} className="strip-item" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <d.I width={24} height={24} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.t}</div>
                <div style={{ fontSize: 13, color: '#9bb19f' }}>{d.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className="section">
        <div className="container">
          <div className="section-head cat-head">
            <span className="eyebrow">Categorias</span>
            <h2 className="display">Tudo pra sua obra<br /><span style={{ color: 'var(--green-700)' }}>em um só lugar.</span></h2>
            <p>Do tijolo à tinta. Mais de 5.000 itens em estoque com pronta entrega.</p>
          </div>
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/produtos?cat=${cat.slug}`}
                className="cat-card card"
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14, padding: 24, minHeight: 200, position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `linear-gradient(135deg, ${cat.color1}, ${cat.color2})`,
                  color: '#fff', display: 'grid', placeItems: 'center',
                }}>
                  <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 16, letterSpacing: '.04em' }}>
                    {cat.title.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 24, letterSpacing: '.01em', textTransform: 'uppercase', lineHeight: 1 }}>
                    {cat.title}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>{cat.tagline}</div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-700)', fontWeight: 600, fontSize: 13 }}>
                  Ver produtos <ArrowIcon width={14} height={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="promo-strip" style={{ background: 'linear-gradient(90deg, var(--yellow) 0%, #ffdc2b 100%)', padding: '24px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container promo-content" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 54, color: 'var(--green-800)', lineHeight: 0.9 }}>15%</div>
            <div>
              <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 24, letterSpacing: '.02em' }}>OFF NA PRIMEIRA COMPRA</div>
              <div style={{ fontSize: 14, color: '#5a4a00' }}>Cupom <strong>OBRA15</strong> • Válido para compras acima de R$ 300</div>
            </div>
          </div>
          <a className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer"
            href={waLink('Olá! Quero usar o cupom OBRA15 e fazer meu primeiro pedido.')}>
            <WhatsAppIcon /> PEGAR DESCONTO
          </a>
        </div>
      </section>

      {/* Destaques */}
      <section className="section">
        <div className="container">
          <div className="products-head" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <span className="eyebrow">Destaques da semana</span>
              <h2 className="display" style={{ fontSize: 'clamp(32px,4.5vw,52px)', marginTop: 8 }}>OFERTAS QUE<br />VALEM A OBRA.</h2>
            </div>
            <Link className="btn btn-outline" href="/produtos">Ver todos <ArrowIcon /></Link>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {PRODUCTS.slice(0, 4).map((p) => (
              <div key={p.id} className="product-card-item">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="why-section section" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div className="why-left">
              <span className="eyebrow">Por que Construmix</span>
              <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,60px)', margin: '12px 0 24px' }}>
                A LOJA QUE <span style={{ color: 'var(--green-700)' }}>RESOLVE</span> SUA OBRA.
              </h2>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
                Tem medo de comprar errado? De atrasar a obra? De pagar caro? Aqui o atendimento
                é diferente: nossos vendedores são gente da construção que te orientam de verdade.
              </p>
              <div className="why-list" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  ['Variedade real', 'Mais de 5.000 itens em estoque, do alicerce ao acabamento.'],
                  ['Preço justo', 'Comparamos com o mercado todo mês pra manter o melhor custo-benefício.'],
                  ['Entrega rápida', 'Em Aracaju no mesmo dia. Interior em até 48h.'],
                  ['Atendimento humano', 'Vendedor de verdade no WhatsApp, sem robô te enrolando.'],
                ].map(([t, d]) => (
                  <div key={t} className="why-item" style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-50)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CheckIcon width={18} height={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{t}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="why-right" style={{ position: 'relative' }}>
              <div style={{
                aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--green-700), var(--green-900))',
                position: 'relative', boxShadow: '0 30px 60px rgba(13,74,26,.30)',
              }}>
                <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Mascot height={520} pose="arms" />
                </div>
                <div style={{ position: 'absolute', top: 24, left: 24, right: 24, color: '#fff' }}>
                  <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 42, lineHeight: 0.95, textTransform: 'uppercase' }}>
                    Vendedor de verdade.
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.85, fontSize: 14 }}>Te ajuda a escolher certo da primeira vez.</div>
                </div>
              </div>
              <div style={{
                position: 'absolute', bottom: -30, left: -30,
                background: '#fff', borderRadius: 18, padding: 22,
                boxShadow: '0 20px 40px rgba(13,74,26,.20)',
                border: '1px solid var(--line)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, minWidth: 260,
              }}>
                <div>
                  <div className="stat-10k" style={{ fontFamily: "'Anton',sans-serif", fontSize: 34, color: 'var(--green-700)', lineHeight: 1 }}>+10K</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Clientes atendidos</div>
                </div>
                <div>
                  <div className="stat-49" style={{ fontFamily: "'Anton',sans-serif", fontSize: 34, color: 'var(--green-700)', lineHeight: 1 }}>4.9★</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Avaliação Google</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Quem comprou aprovou</span>
            <h2 className="display">O QUE FALAM<br />POR AÍ DA GENTE.</h2>
          </div>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div style={{ display: 'flex', gap: 2, marginBottom: 12, color: '#fbbf24' }}>
                  {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} width={18} height={18} />)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-700)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{t.name[0]}</div>
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

      {/* CTA final */}
      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container cta-final" style={{ position: 'relative', textAlign: 'center' }}>
          <h2 className="display" style={{ fontSize: 'clamp(38px,5.5vw,68px)', marginBottom: 18 }}>
            BORA TIRAR ESSA<br />
            <span style={{ color: 'var(--yellow)' }}>OBRA DO PAPEL?</span>
          </h2>
          <p style={{ maxWidth: 560, margin: '0 auto 32px', color: '#cfd6cf', fontSize: 17, lineHeight: 1.55 }}>
            Manda sua lista no WhatsApp ou faz um orçamento aqui no site. A gente responde rápido
            e ainda te ajuda a escolher o que combina melhor com sua obra.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer"
              href={waLink('Olá! Quero fazer um orçamento rápido.')}>
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
