import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Fondea',
  description: 'Cobro Hoy (Cesión de Cuotas) — Fondea',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
