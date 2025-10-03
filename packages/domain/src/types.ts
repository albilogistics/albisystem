export type Line = '14d' | '42d' | '6m' | '9m' | '12m';

export interface Installment {
  id: string; // installment_id
  orderId: string; // order_id
  merchantId: string;
  line: Line; // 14d | 42d | 6m | 9m | 12m
  faceUSD: number; // monto USD de la cuota
  dueDate: string; // ISO
  imeiSerial?: string;
  city?: string;
  category?: string; // 'telefonia' | 'electro' | 'moda' | ...
}

export interface AssignmentQuote {
  installmentId: string;
  discountPct: number; // tarifa por línea + ajustes
  holdbackPct: number; // 0.02 — 0.03
  priceUSD: number; // faceUSD * (1 - discount - holdback)
}

export interface PricingConfig {
  base: Record<Line, number>; // 14d:0.05, 42d:0.075, 6m:0.12, ...
  adjCategory: Record<string, number>; // p.ej. telefonia:+0.002
  adjRiskBand: Record<'verde' | 'ambar' | 'roja', number>;
}

export interface RemittanceCut {
  time: '11:00' | '17:00';
}

export interface FXPolicy {
  mode: 'usd' | 'ves';
  maxSpread: number;
}
