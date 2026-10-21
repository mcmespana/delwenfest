import { EVENT, VENUE } from '../data/event';

// Avisos del evento en el calendario: el día antes y 2 horas antes
const ALARMS = [
  { trigger: '-P1D', label: 'mañana' },
  { trigger: '-PT2H', label: 'en 2 horas' },
];

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// RFC 5545: líneas de máx. 75 octetos, continuando con un espacio
function fold(line: string) {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const ch of line) {
    const limit = parts.length ? 74 : 75;
    if (enc.encode(current + ch).length > limit) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildIcs() {
  const description = [
    'Festival solidario a beneficio de la ONGD Delwende.',
    '17:15 Bienvenida · 17:45 Bingo musical · 19:00 Sinbikini · 20:00 Rifa · 20:30 Rodhel Show DJ · 22:30 Final.',
    `${VENUE.entrance} (${VENUE.entranceHint}).`,
    EVENT.url,
  ].join('\n');
  const [lat, lng] = VENUE.entranceCoords;
  const address = `${VENUE.street}, ${VENUE.city}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MCM Castellón//DELWENFEST 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:delwenfest-2026@movimientoconsolacion.com',
    'DTSTAMP:20261021T120000Z',
    'DTSTART:20261030T161500Z',
    'DTEND:20261030T213000Z',
    `SUMMARY:${escape('DELWENFEST · Festival solidario Delwende')}`,
    `LOCATION:${escape(`${VENUE.name}, ${address}`)}`,
    `X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS="${address}";X-APPLE-RADIUS=60;X-TITLE="Entrada DELWENFEST (C/ Mª Rosa Molas)":geo:${lat},${lng}`,
    `GEO:${lat};${lng}`,
    `URL:${EVENT.url}`,
    `DESCRIPTION:${escape(description)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    ...ALARMS.flatMap((a) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escape(`DELWENFEST ${a.label}`)}`, `TRIGGER:${a.trigger}`, 'END:VALARM']),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
