import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Construmix — Gestão & Orçamento',
  description: 'App interno de gestão e orçamento da Construmix, integrado ao Zeus.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
