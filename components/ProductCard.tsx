import { Product, waLink } from '@/lib/data';
import { WhatsAppIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product: p }: ProductCardProps) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        aspectRatio: '4/3',
        background: `linear-gradient(135deg, ${p.bg1}, ${p.bg2})`,
        position: 'relative', display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          fontFamily: "'Anton',sans-serif", fontSize: 84, color: 'rgba(255,255,255,.85)',
          letterSpacing: '.02em', lineHeight: 0.9, padding: '0 20px', textAlign: 'center',
        }}>{p.glyph}</div>
        {p.tag && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'var(--yellow)', color: '#1a1a1a',
            padding: '4px 10px', borderRadius: 6,
            fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
          }}>{p.tag}</div>
        )}
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--green-700)', textTransform: 'uppercase' }}>{p.cat}</div>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, minHeight: 38 }}>{p.name}</div>
        <div style={{ marginTop: 'auto' }}>
          {p.from && <div style={{ fontSize: 12, color: 'var(--muted)' }}>a partir de</div>}
          <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 30, color: 'var(--green-700)', lineHeight: 1 }}>
            R$ {p.price.toFixed(2).replace('.', ',')}
            {p.unit && <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 6, fontFamily: 'Inter', fontWeight: 600 }}>/{p.unit}</span>}
          </div>
        </div>
        <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, padding: '10px 14px', fontSize: 13 }}
          href={waLink(`Olá! Tenho interesse no ${p.name}. Pode me passar mais detalhes?`)}>
          <WhatsAppIcon width={16} height={16} /> Tenho interesse
        </a>
      </div>
    </div>
  );
}
