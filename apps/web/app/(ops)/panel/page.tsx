export default function OpsPanel() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Monto vivo por línea</h2>
        <p className="text-sm text-muted-foreground">Métricas próximamente</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">SLA de remesas</h2>
        <p className="text-sm text-muted-foreground">Cortes 11:00 / 17:00</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Spread FX efectivo</h2>
        <p className="text-sm text-muted-foreground">Alertas si excede tope</p>
      </div>
      <div className="rounded-lg border p-6">
        <h2 className="font-medium mb-2">Alertas</h2>
        <p className="text-sm text-muted-foreground">Monitoreo y kill-switch</p>
      </div>
    </div>
  );
}
