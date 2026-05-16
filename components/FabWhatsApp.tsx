import { WhatsAppIcon } from './Icons';
import { waLink } from '@/lib/data';

export default function FabWhatsApp() {
  return (
    <a
      className="fab-wa"
      target="_blank"
      rel="noopener noreferrer"
      href={waLink('Olá! Vim pelo site da Construmix e quero atendimento.')}
    >
      <span className="fab-icon">
        <WhatsAppIcon />
      </span>
      Fale agora
    </a>
  );
}
