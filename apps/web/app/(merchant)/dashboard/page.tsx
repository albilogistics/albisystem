export default function MerchantDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Subir CSV</h2>
        <p className="text-sm text-muted-foreground mb-4">Sube tu archivo ANEXO_CESION.csv</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Simulador de Cesión</h2>
        <p className="text-sm text-muted-foreground mb-4">Simulador de tarifas por plazo</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Historial</h2>
        <p className="text-sm text-muted-foreground mb-4">Revisa cesiones previas</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Ajustes</h2>
        <p className="text-sm text-muted-foreground mb-4">Holdback (reserva) y devoluciones</p>
      </div>
    </div>
  );
}
