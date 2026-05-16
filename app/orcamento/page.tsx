'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CATEGORIES, waLink } from '@/lib/data';
import { WhatsAppIcon, CheckIcon, ArrowIcon, CloseIcon, DocIcon } from '@/components/Icons';

interface OrcData {
  nome: string; telefone: string; email: string; cidade: string;
  obraTipo: string; categorias: string[];
  items: { nome: string; qtd: string }[];
  prazo: string; detalhes: string; canal: string;
}

function Stepper({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: active || done ? 'var(--green-700)' : '#eef0ed',
              color: active || done ? '#fff' : 'var(--muted)',
              display: 'grid', placeItems: 'center',
              fontFamily: "'Anton',sans-serif", fontSize: 14,
              transition: 'all .3s',
            }}>
              {done ? <CheckIcon width={14} height={14} /> : idx}
            </div>
            <span style={{ fontWeight: active ? 700 : 500, fontSize: 13, color: active ? 'var(--ink)' : done ? 'var(--green-800)' : 'var(--muted)' }}>{s}</span>
            {i < steps.length - 1 && (
              <div style={{ width: 28, height: 2, background: done ? 'var(--green-700)' : '#eef0ed', borderRadius: 2, margin: '0 4px', transition: 'background .3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function OrcamentoPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OrcData>({
    nome: '', telefone: '', email: '', cidade: 'Aracaju',
    obraTipo: 'reforma', categorias: [],
    items: [{ nome: '', qtd: '' }],
    prazo: '30', detalhes: '', canal: 'whatsapp',
  });
  const formRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const update = (k: keyof OrcData, v: OrcData[keyof OrcData]) => setData((d) => ({ ...d, [k]: v }));
  const toggleCat = (slug: string) => setData((d) => ({
    ...d,
    categorias: d.categorias.includes(slug)
      ? d.categorias.filter((c) => c !== slug)
      : [...d.categorias, slug],
  }));
  const setItem = (i: number, key: 'nome' | 'qtd', val: string) => setData((d) => ({
    ...d, items: d.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it),
  }));
  const addItem = () => setData((d) => ({ ...d, items: [...d.items, { nome: '', qtd: '' }] }));
  const removeItem = (i: number) => setData((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));

  const buildMessage = () => {
    const tipoMap: Record<string, string> = { construcao: 'Construção', reforma: 'Reforma', acabamento: 'Acabamento', outros: 'Outros' };
    return [
      '*ORÇAMENTO CONSTRUMIX*', '',
      `*Nome:* ${data.nome}`, `*Telefone:* ${data.telefone}`,
      data.email ? `*E-mail:* ${data.email}` : '',
      `*Cidade:* ${data.cidade}`,
      `*Tipo de obra:* ${tipoMap[data.obraTipo] || data.obraTipo}`,
      `*Prazo:* ${data.prazo} dias`, '',
      '*Categorias de interesse:*',
      ...data.categorias.map((s) => '• ' + (CATEGORIES.find((c) => c.slug === s)?.title || s)),
      '', '*Itens:*',
      ...data.items.filter((i) => i.nome).map((i) => `• ${i.nome}${i.qtd ? ` — ${i.qtd}` : ''}`),
      '', data.detalhes ? `*Detalhes:* ${data.detalhes}` : '',
    ].filter(Boolean).join('\n');
  };

  const canNext1 = data.nome && data.telefone.length >= 8;
  const canNext2 = data.categorias.length > 0;

  // Animate step transitions
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      if (!formRef.current) return;
      gsap.from(formRef.current.querySelector('.step-content'), {
        opacity: 0, y: 20, duration: 0.35, ease: 'power2.out',
      });
    };
    init();
  }, [step]);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!pageRef.current) return;

      ctx = gsap.context(() => {
        gsap.from('.orc-hero > *', { opacity: 0, y: 50, stagger: 0.14, duration: 0.7, ease: 'power3.out', delay: 0.1 });
        gsap.from('.orc-sidebar > *', {
          opacity: 0, x: 50, stagger: 0.15, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.orc-sidebar', start: 'top 85%', once: true },
        });
      }, pageRef.current);
    };
    init();
    return () => ctx?.revert();
  }, []);

  const chipStyle = (active: boolean) => ({
    padding: '10px 16px', borderRadius: 99,
    background: active ? 'var(--green-700)' : '#fff',
    color: active ? '#fff' : 'var(--ink-2)',
    border: `1.5px solid ${active ? 'var(--green-700)' : 'var(--line)'}`,
    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
  });

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section style={{ background: 'var(--green-700)', color: '#fff', padding: '56px 0 72px', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div className="container orc-hero" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: '#fff', opacity: 0.85 }}>Orçamento online</span>
          <h1 className="display" style={{ fontSize: 'clamp(40px,5.5vw,72px)', marginTop: 10, marginBottom: 14 }}>
            MONTA SEU PEDIDO<br />
            <span style={{ color: 'var(--yellow)' }}>E A GENTE COTA NA HORA.</span>
          </h1>
          <p style={{ maxWidth: 560, fontSize: 17, color: '#dff2e3' }}>
            Diz o que precisa que retornamos com o melhor preço — geralmente em até 1 hora útil.
            Sem compromisso, sem enrolação.
          </p>
        </div>
      </section>

      {/* Form area */}
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
          {/* Main form */}
          <div ref={formRef} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', background: '#fff' }}>
              <Stepper step={step} steps={['Seus dados', 'O que precisa', 'Detalhes', 'Pronto']} />
            </div>

            <div style={{ padding: '32px 32px 36px' }}>
              {step === 1 && (
                <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h3 className="display" style={{ fontSize: 30, margin: '0 0 6px' }}>SEUS DADOS</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 0, marginBottom: 8 }}>Pra gente entrar em contato e te mandar o orçamento.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Nome completo *" value={data.nome} onChange={(v) => update('nome', v)} placeholder="Como podemos te chamar?" />
                    <Field label="WhatsApp / Telefone *" value={data.telefone} onChange={(v) => update('telefone', v)} placeholder="(79) 9 9999-9999" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="E-mail (opcional)" value={data.email} onChange={(v) => update('email', v)} placeholder="seu@email.com" />
                    <Field label="Cidade" value={data.cidade} onChange={(v) => update('cidade', v)} placeholder="Aracaju" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Tipo de obra</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[['construcao', 'Construção do zero'], ['reforma', 'Reforma'], ['acabamento', 'Só acabamento'], ['outros', 'Outros']].map(([v, l]) => (
                        <button key={v} onClick={() => update('obraTipo', v)} style={chipStyle(data.obraTipo === v)}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button className="btn btn-primary btn-lg" disabled={!canNext1} onClick={() => setStep(2)}
                      style={!canNext1 ? { opacity: 0.45, cursor: 'not-allowed' } : {}}>
                      Próximo <ArrowIcon />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 className="display" style={{ fontSize: 30, margin: '0 0 6px' }}>O QUE VOCÊ PRECISA?</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 0 }}>Selecione as categorias e adicione os itens da sua lista.</p>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 10 }}>Categorias *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                      {CATEGORIES.map((c) => {
                        const active = data.categorias.includes(c.slug);
                        return (
                          <button key={c.slug} onClick={() => toggleCat(c.slug)} style={{
                            padding: '14px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                            background: active ? 'var(--green-50)' : '#fff',
                            border: `1.5px solid ${active ? 'var(--green-700)' : 'var(--line)'}`,
                            display: 'flex', gap: 10, alignItems: 'center', transition: 'all .15s',
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
                              color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
                            }}>
                              <span style={{ fontSize: 10, fontWeight: 700 }}>{c.slug.slice(0, 3).toUpperCase()}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--green-800)' : 'var(--ink-2)', lineHeight: 1.2 }}>{c.title}</span>
                            {active && <span style={{ marginLeft: 'auto', color: 'var(--green-700)' }}><CheckIcon width={18} height={18} /></span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 10 }}>Lista de itens (opcional)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {data.items.map((it, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 40px', gap: 10, alignItems: 'center' }}>
                          <input value={it.nome} onChange={(e) => setItem(i, 'nome', e.target.value)}
                            placeholder="Ex: Porcelanato 60x60 marmorizado"
                            style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 0 }} />
                          <input value={it.qtd} onChange={(e) => setItem(i, 'qtd', e.target.value)}
                            placeholder="qtd / m²"
                            style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 0 }} />
                          <button onClick={() => removeItem(i)} disabled={data.items.length === 1}
                            style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', color: '#991b1b', display: 'grid', placeItems: 'center', cursor: 'pointer', opacity: data.items.length === 1 ? 0.4 : 1, border: 0 }}>
                            <CloseIcon width={18} height={18} />
                          </button>
                        </div>
                      ))}
                      <button onClick={addItem}
                        style={{ padding: '10px 14px', borderRadius: 10, background: '#fff', border: '1.5px dashed var(--line)', color: 'var(--green-700)', fontWeight: 600, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center' }}>
                        + Adicionar item
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button className="btn btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
                    <button className="btn btn-primary btn-lg" disabled={!canNext2} onClick={() => setStep(3)}
                      style={!canNext2 ? { opacity: 0.45, cursor: 'not-allowed' } : {}}>
                      Próximo <ArrowIcon />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 className="display" style={{ fontSize: 30, margin: '0 0 6px' }}>DETALHES FINAIS</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 0 }}>Quase lá! Mais alguns detalhes pra gente caprichar no orçamento.</p>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 10 }}>Prazo da obra</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[['urgente', 'Urgente (esta semana)'], ['15', 'Até 15 dias'], ['30', 'Em 30 dias'], ['60', '60 dias ou mais']].map(([v, l]) => (
                        <button key={v} onClick={() => update('prazo', v)} style={chipStyle(data.prazo === v)}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Detalhes adicionais (opcional)</label>
                    <textarea value={data.detalhes} onChange={(e) => update('detalhes', e.target.value)}
                      rows={4} placeholder="Ex: piso pra área externa antiderrapante, cor clara. Tinta lavável pra quarto..."
                      style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 15, border: '1.5px solid var(--line)', borderRadius: 11, padding: '14px 16px', outline: 0 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 10 }}>Como prefere receber o orçamento?</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[['whatsapp', 'WhatsApp'], ['email', 'E-mail'], ['ambos', 'Os dois']].map(([v, l]) => (
                        <button key={v} onClick={() => update('canal', v)} style={chipStyle(data.canal === v)}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>← Voltar</button>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <a className="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer" href={waLink(buildMessage())}>
                        <WhatsAppIcon /> ENVIAR PELO WHATSAPP
                      </a>
                      <button className="btn btn-primary btn-lg" onClick={() => setStep(4)}>
                        Enviar orçamento <ArrowIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="step-content" style={{ textAlign: 'center', padding: '20px 0 16px' }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}>
                    <CheckIcon width={48} height={48} />
                  </div>
                  <h3 className="display" style={{ fontSize: 42, margin: '0 0 12px' }}>RECEBEMOS SEU PEDIDO!</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.55 }}>
                    Em até <strong style={{ color: 'var(--green-800)' }}>1 hora útil</strong> um vendedor da Construmix retorna pra você
                    com o orçamento completo, {data.canal === 'email' ? 'pelo e-mail' : data.canal === 'ambos' ? 'pelo WhatsApp e e-mail' : 'pelo WhatsApp'}.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a className="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer" href={waLink(buildMessage())}>
                      <WhatsAppIcon /> Falar agora no WhatsApp
                    </a>
                    <Link className="btn btn-outline btn-lg" href="/produtos">Ver mais produtos</Link>
                  </div>
                  <div style={{ marginTop: 32, padding: 20, background: 'var(--bg)', borderRadius: 14, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-700)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Resumo enviado</div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{buildMessage().replace(/\*/g, '')}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="orc-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card" style={{ background: 'var(--ink)', color: '#fff', padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="eyebrow" style={{ color: 'var(--yellow)' }}>Prefere falar direto?</span>
                <div className="display" style={{ fontSize: 32, marginTop: 8, marginBottom: 14, color: '#fff' }}>CHAMA NO ZAP.</div>
                <p style={{ fontSize: 14, color: '#cfd6cf', lineHeight: 1.5, marginBottom: 16 }}>
                  Atendimento humano de segunda a sábado. Você manda fotos, lista, áudio — a gente cota tudo na hora.
                </p>
                <a className="btn btn-wa" style={{ width: '100%' }} target="_blank" rel="noopener noreferrer"
                  href={waLink('Olá! Quero falar com um vendedor pra fazer um orçamento.')}>
                  <WhatsAppIcon /> (79) 99919-6363
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div className="eyebrow">Como funciona</div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['Você manda sua lista', 'Aqui no site ou direto no WhatsApp.'],
                  ['A gente cota tudo', 'Em até 1 hora útil já volta com o orçamento.'],
                  ['Fecha e a obra anda', 'Pagamento facilitado, entrega rápida.'],
                ].map(([t, d], i) => (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-700)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: "'Anton',sans-serif", fontSize: 16, flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div className="eyebrow">Garantias</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Cotação sem compromisso', 'Melhor preço da região', 'Entrega em todo Sergipe', 'Retirada na loja em 30 min', 'Parcelamento em até 15x'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--green-50)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CheckIcon width={14} height={14} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
