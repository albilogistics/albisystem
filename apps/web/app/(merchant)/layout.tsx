import type { ReactNode } from 'react';
import Link from 'next/link';

export default function MerchantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-6">
          <Link href="/" className="font-semibold">Fondea Comercios</Link>
          <Link href="/(merchant)/dashboard" className="text-sm">Dashboard</Link>
          <Link href="/(merchant)/cesiones/nueva" className="text-sm">Cobro Hoy</Link>
          <Link href="/(merchant)/historial" className="text-sm">Historial</Link>
          <Link href="/(merchant)/ajustes" className="text-sm">Ajustes</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
