import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Construmix — Gestão & Orçamento',
  description: 'App interno de gestão e orçamento da Construmix, integrado ao Zeus.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

// Cor da barra do navegador/janela quando instalado como app (ver public/manifest.json).
export const viewport = {
  themeColor: '#1a8a2e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
