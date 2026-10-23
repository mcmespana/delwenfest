/*
 * Captación de socios/as durante el DelwenFest: estados de cada persona apuntada,
 * sonidos del contador y cálculo de la desgravación (Ley 49/2002).
 */

export const ESTADOS = [
  { id: 'contactar', label: 'Contactar la semana que viene', short: 'Contactar', color: 'var(--color-gold)' },
  { id: 'alta_web', label: 'Ya se ha dado de alta en la web', short: 'Alta en la web', color: 'var(--color-lime)' },
  { id: 'ficha', label: 'Ha entregado la ficha', short: 'Ficha entregada', color: 'var(--color-teal)' },
  { id: 'formulario', label: 'Lo hará por su cuenta en el formulario', short: 'Lo hará por el formulario', color: 'var(--color-pink)' },
  { id: 'ya_socio', label: 'Ya era socio/a', short: 'Ya era socio/a', color: 'var(--color-mint)' },
] as const;

export type EstadoId = (typeof ESTADOS)[number]['id'];
export const ESTADO_IDS = ESTADOS.map((e) => e.id) as EstadoId[];
export const ESTADO_DEFECTO: EstadoId = 'contactar';

/** De dónde viene cada fila: el formulario del equipo o el QR que escanea la gente. */
export type Origen = 'equipo' | 'qr';

export type Socio = {
  id: number;
  nombre: string;
  telefono: string;
  estado: EstadoId;
  nota: string;
  origen: Origen;
  creado: string;
};

export type Config = { ajuste: number; sonido: string; ping: number; qr: boolean };

export const SONIDOS = [
  { id: 'carillon', nombre: 'Carillón de fiesta', desc: 'Cuatro campanas que suben' },
  { id: 'campana', nombre: 'Campana grande', desc: 'Un solo golpe, de campanario' },
  { id: 'campanillas', nombre: 'Lluvia de campanillas', desc: 'Brillante y rápida' },
  { id: 'dingdong', nombre: 'Ding-dong', desc: 'Timbre de bienvenida' },
  { id: 'barco', nombre: 'Campana doble', desc: 'Ding-ding, como en los barcos' },
  { id: 'fanfarria', nombre: 'Fanfarria y campana', desc: 'Trompetas y final de campana' },
] as const;
export type SonidoId = (typeof SONIDOS)[number]['id'];

/* ------------------------------------------------------------------ */
/*  Desgravación                                                       */
/* ------------------------------------------------------------------ */

export const PERIODOS = [
  { id: 'mensual', label: 'Mensual', cada: 'al mes', veces: 12, cuotas: [5, 10, 15, 20, 30, 50], defecto: 10 },
  { id: 'trimestral', label: 'Trimestral', cada: 'al trimestre', veces: 4, cuotas: [15, 30, 45, 60, 90, 120], defecto: 30 },
  { id: 'semestral', label: 'Semestral', cada: 'al semestre', veces: 2, cuotas: [30, 60, 90, 120, 180, 240], defecto: 60 },
] as const;
export type PeriodoId = (typeof PERIODOS)[number]['id'];

/** Tramos de la deducción en el IRPF desde 2024 (Ley 49/2002, art. 19). */
export const IRPF = { tramo: 250, base: 0.8, resto: 0.4, restoFiel: 0.45 };

/** Deducción anual de un particular. `fiel`: 3.er año seguido o más con la misma cuota o más. */
export function deduccion(anual: number, fiel = false) {
  return Math.min(anual, IRPF.tramo) * IRPF.base + Math.max(0, anual - IRPF.tramo) * (fiel ? IRPF.restoFiel : IRPF.resto);
}

export function eur(n: number) {
  const r = Math.round(n * 100) / 100;
  return r.toLocaleString('es-ES', { minimumFractionDigits: Number.isInteger(r) ? 0 : 2, maximumFractionDigits: 2 });
}

/** Los cinco puntos clave de la Ley 49/2002 para explicarlos en la mesa. */
export const LEY49 = [
  {
    title: 'Tu cuota es un donativo que desgrava',
    text: 'Delwende está acogida a la Ley 49/2002 de mecenazgo. Lo que aportas como socio/a cuenta como donativo y te lo deduces en la declaración de la renta.',
  },
  {
    title: 'Los primeros 250 € al año: te devuelven el 80 %',
    text: 'Si aportas 120 € al año (10 € al mes), Hacienda te descuenta 96 € y de verdad te cuesta 24 €: 2 € al mes. El tramo de 250 € es por persona y año, sumando todos tus donativos.',
  },
  {
    title: 'A partir de 250 €: el 40 %, o el 45 % si eres fiel',
    text: 'Lo que pase de 250 € al año se deduce al 40 %. Si es tu tercer año seguido (o más) dando a Delwende la misma cantidad o más, esa parte sube al 45 %.',
  },
  {
    title: 'Solo hace falta tu DNI',
    text: 'Al darte de alta pones tu NIF. Delwende lo comunica a Hacienda a principios de año (modelo 182) y la deducción aparece sola en tu borrador de la renta. No tienes que guardar recibos.',
  },
  {
    title: 'Se resta de lo que pagas en la renta',
    text: 'Se descuenta de tu cuota del IRPF, con el límite del 10 % de tu base liquidable. Si no pagas IRPF no hay deducción, pero tu cuota ayuda igual. Las empresas deducen el 40 % (50 % si son fieles) en Sociedades.',
  },
] as const;
