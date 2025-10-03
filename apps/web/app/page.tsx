import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold mb-6">Fondea</h1>
      <p className="text-muted-foreground mb-8">Cobro Hoy (Cesión de Cuotas)</p>
      <div className="grid gap-4">
        <Link className="underline" href="/(merchant)/dashboard">Ir a Portal de Comercios</Link>
        <Link className="underline" href="/(ops)/panel">Ir a Consola Interna</Link>
      </div>
    </main>
  );
}
