import { seguro } from '../../lib/api';
import { leerPanel } from '../../lib/db';
import { ESTADOS } from '../../data/socios';

export const prerender = false;

const celda = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const hora = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'short', timeStyle: 'short' });

/** Listado para llamar la semana que viene. Separado por «;» para que Excel lo abra bien. */
export const GET = seguro(async () => {
  const { socios } = await leerPanel();
  const filas = [
    ['Fecha', 'Nombre', 'Teléfono', 'Estado', 'Origen', 'Nota'],
    ...socios
      .slice()
      .reverse()
      .map((s) => [
        hora.format(new Date(s.creado)),
        s.nombre,
        s.telefono,
        ESTADOS.find((e) => e.id === s.estado)?.label ?? s.estado,
        s.origen === 'qr' ? 'QR' : 'Equipo',
        s.nota,
      ]),
  ];
  const csv = '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="socios-delwenfest.csv"',
      'Cache-Control': 'no-store',
    },
  });
});
