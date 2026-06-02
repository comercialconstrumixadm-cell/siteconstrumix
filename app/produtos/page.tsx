'use client';
import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Mascot from '@/components/Mascot';
import { SearchIcon, DocIcon, WhatsAppIcon } from '@/components/Icons';
import { CATEGORIES, PRODUCTS, waLink } from '@/lib/data';
import { pixelContact, pixelLead, pixelButtonClick } from '@/lib/pixel';

function ProdutosContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(searchParams.get('cat') || 'todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('relevance');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActive(cat);
  }, [searchParams]);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!pageRef.current) return;

      ctx = gsap.context(() => {
        gsap.from('.produtos-hero-content > *', {
          opacity: 0, y: 50, stagger: 0.15, duration: 0.7, ease: 'power3.out', delay: 0.1,
        });
        gsap.from('.helper-banner', {
          opacity: 0, y: 60, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.helper-banner', start: 'top 88%', once: true },
        });
      }, pageRef.current);
    };
    init();
    return () => ctx?.revert();
  }, []);

  // Animate cards when filter changes
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      gsap.from('.product-grid-item', {
        opacity: 0, y: 30, scale: 0.95, stagger: 0.06, duration: 0.4, ease: 'power2.out',
      });
    };
    init();
  }, [active, query, sort]);

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (active !== 'todos') {
      const catName = CATEGORIES.find((c) => c.slug === active)?.title.split(' ')[0] || '';
      list = list.filter((p) => p.cat.toLowerCase().includes(catName.toLowerCase()));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [active, query, sort]);

  return (
    <div ref={pageRef}>
      {/* Banner */}
      <section style={{ background: 'var(--green-700)', color: '#fff', padding: '56px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <svg style={{ position: 'absolute', top: -20, right: -40, width: 300, height: 300, opacity: 0.18 }} viewBox="0 0 300 300">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 5 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={20 + c * 52} cy={20 + r * 52} r="16" fill="none" stroke="#fff" strokeWidth="3" />
            ))
          )}
        </svg>
        <div className="container produtos-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: '#fff', opacity: 0.85 }}>Catálogo Construmix</span>
          <h1 className="display" style={{ fontSize: 'clamp(44px,6vw,80px)', marginTop: 10, marginBottom: 14 }}>
            TUDO PRA SUA OBRA<br />
            <span style={{ color: 'var(--yellow)' }}>NUM SÓ LUGAR.</span>
          </h1>
          <p style={{ maxWidth: 560, fontSize: 17, color: '#dff2e3' }}>
            Mais de 5.000 itens em estoque. Achou aqui, pode chegar com sua lista no WhatsApp e a gente
            monta seu orçamento na hora.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: 'var(--nav-h)', zIndex: 30,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)', padding: '14px 0',
      }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: 240, maxWidth: 380 }}>
            <SearchIcon width={18} height={18} style={{ position: 'absolute', top: 13, left: 14, color: 'var(--muted)' }} />
            <input
              placeholder="Buscar produto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 42px',
                border: '1.5px solid var(--line)', borderRadius: 11,
                fontFamily: 'inherit', fontSize: 14, outline: 0, background: '#fff',
              }}
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: 11, fontFamily: 'inherit', fontSize: 14, background: '#fff' }}>
            <option value="relevance">Relevância</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name">A-Z</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> produto{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Category chips */}
      <section style={{ padding: '28px 0 0' }}>
        <div className="container" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setActive('todos'); pixelButtonClick('Todos', 'filtros_categoria', 'todos'); }}
            style={{
              padding: '10px 16px', borderRadius: 99,
              background: active === 'todos' ? 'var(--green-700)' : '#fff',
              color: active === 'todos' ? '#fff' : 'var(--ink-2)',
              border: `1.5px solid ${active === 'todos' ? 'var(--green-700)' : 'var(--line)'}`,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            }}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setActive(c.slug); pixelButtonClick(c.title, 'filtros_categoria', c.slug); }}
              style={{
                padding: '10px 16px', borderRadius: 99,
                background: active === c.slug ? 'var(--green-700)' : '#fff',
                color: active === c.slug ? '#fff' : 'var(--ink-2)',
                border: `1.5px solid ${active === c.slug ? 'var(--green-700)' : 'var(--line)'}`,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {c.title}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: '#fff', borderRadius: 18, border: '1px solid var(--line)' }}>
              <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 32, color: 'var(--ink)' }}>Nenhum produto encontrado</div>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Tente outro filtro ou chame a gente no WhatsApp — temos muito mais em estoque!</p>
              <a className="btn btn-wa" style={{ marginTop: 20 }} target="_blank" rel="noopener noreferrer"
                href={waLink('Olá! Não achei o que precisava no site. Vocês têm?')}
                onClick={() => pixelContact()}>
                <WhatsAppIcon /> Perguntar no WhatsApp
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
              {filtered.map((p) => (
                <div key={p.id} className="product-grid-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Helper banner */}
      <section className="helper-banner" style={{ background: '#fff', borderTop: '1px solid var(--line)', padding: '56px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800), var(--green-700))',
            color: '#fff', borderRadius: 24, padding: '48px 56px',
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="eyebrow" style={{ color: 'var(--yellow)' }}>Não achou o que precisa?</span>
              <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,46px)', marginTop: 10, marginBottom: 14 }}>
                TEMOS MUITO MAIS<br />EM ESTOQUE NA LOJA.
              </h2>
              <p style={{ fontSize: 16, color: '#dff2e3', lineHeight: 1.5, marginBottom: 22 }}>
                Manda sua lista no WhatsApp ou fala com o vendedor pessoalmente.
                A gente cota tudo na hora e separa o que você precisar.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a className="btn btn-yellow" target="_blank" rel="noopener noreferrer"
                  href={waLink('Olá! Tenho uma lista de materiais. Pode me cotar?')}
                  onClick={() => pixelContact()}>
                  <WhatsAppIcon /> ENVIAR MINHA LISTA
                </a>
                <Link className="btn btn-outline" href="/orcamento"
                  onClick={() => pixelLead()}
                  style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
                  <DocIcon /> Orçamento online
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 2 }}>
              <Mascot height={280} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center' }}>Carregando...</div>}>
      <ProdutosContent />
    </Suspense>
  );
}
