import type { ReactNode } from 'react';
import Link from 'next/link';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-6">
          <Link href="/" className="font-semibold">Fondea Ops</Link>
          <Link href="/(ops)/panel" className="text-sm">Panel</Link>
          <Link href="/(ops)/pricing" className="text-sm">Pricing</Link>
          <Link href="/(ops)/conciliacion" className="text-sm">Conciliación</Link>
          <Link href="/(ops)/fx" className="text-sm">FX</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
