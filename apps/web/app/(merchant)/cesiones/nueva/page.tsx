export default function NuevaCesion() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Cobro Hoy (Cesión de Cuotas)</h1>
      <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
        <li>Sube tu archivo ANEXO_CESION.csv</li>
        <li>Previsualiza cuotas elegibles</li>
        <li>Simula precios por plazo y holdback</li>
        <li>Selecciona y confirma la cesión</li>
        <li>Descargar Recibo (PDF)</li>
      </ol>
    </div>
  );
}
