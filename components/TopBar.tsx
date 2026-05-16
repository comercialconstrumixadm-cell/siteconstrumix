'use client';
import { MapPinIcon, ClockIcon, PhoneIcon, InstagramIcon } from './Icons';
import { WA_PHONE } from '@/lib/data';

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="container row">
        <div>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <MapPinIcon /> Rua Simeão Aguiar, 147 — José Conrado de Araújo, Aracaju/SE
          </span>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ClockIcon /> Seg a Sex 7h–18h • Sáb 7h–13h
          </span>
        </div>
        <div>
          <a href={`tel:+${WA_PHONE}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <PhoneIcon /> (79) 99919-6363
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <InstagramIcon /> @construmixaracaju
          </a>
        </div>
      </div>
    </div>
  );
}
