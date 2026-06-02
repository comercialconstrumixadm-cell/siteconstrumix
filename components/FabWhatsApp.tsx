'use client';
import { WhatsAppIcon } from './Icons';
import { waLink } from '@/lib/data';
import { pixelContact } from '@/lib/pixel';

export default function FabWhatsApp() {
  return (
    <a
      className="fab-wa"
      target="_blank"
      rel="noopener noreferrer"
      href={waLink('Olá! Vim pelo site da Construmix e quero atendimento.')}
      onClick={() => pixelContact()}
    >
      <span className="fab-icon">
        <WhatsAppIcon />
      </span>
      Fale agora
    </a>
  );
}
