import type { Metadata } from 'next';
import { Inter, Anton } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import FabWhatsApp from '@/components/FabWhatsApp';
import MetaPixel from '@/components/MetaPixel';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });

export const metadata: Metadata = {
  title: 'Comercial Construmix — Aracaju/SE • Materiais de Construção do Alicerce ao Acabamento',
  description: 'Pisos, portas, hidráulica, elétrica, tintas, ferramentas e mais. Atendimento físico e online em Aracaju/SE. Entrega para todo Sergipe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${anton.variable}`}>
      <body>
        <MetaPixel />
        <TopBar />
        <Nav />
        <main>{children}</main>
        <Footer />
        <FabWhatsApp />
      </body>
    </html>
  );
}
