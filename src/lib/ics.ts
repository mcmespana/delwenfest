import { EVENT, VENUE } from '../data/event';

/** Avisos que se pueden elegir en el recordatorio (máx. 2, lo que admite el calendario del iPhone). */
export const ALARMS = [
  { key: '1s', trigger: '-P7D', label: '1 semana antes', when: 'Vie 6 nov' },
  { key: '1d', trigger: '-P1D', label: 'El día antes', when: 'Jue 12 · 17:15' },
  { key: '2h', trigger: '-PT2H', label: '2 horas antes', when: 'Vie 13 · 15:15' },
  { key: '30m', trigger: '-PT30M', label: '30 min antes', when: 'Vie 13 · 16:45' },
] as const;

export type AlarmKey = (typeof ALARMS)[number]['key'];

export const DEFAULT_ALARMS: AlarmKey[] = ['1d', '2h'];

/** Todas las combinaciones de 1 o 2 avisos, en el orden de ALARMS. */
export function alarmVariants(): AlarmKey[][] {
  const keys = ALARMS.map((a) => a.key);
  const out: AlarmKey[][] = keys.map((k) => [k]);
  keys.forEach((a, i) => keys.slice(i + 1).forEach((b) => out.push([a, b])));
  return out;
}

export const variantSlug = (keys: AlarmKey[]) => keys.join('-');

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

export function buildIcs(alarms: readonly AlarmKey[]) {
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
    'SEQUENCE:1',
    'DTSTAMP:20261029T120000Z',
    'DTSTART:20261113T161500Z',
    'DTEND:20261113T213000Z',
    `SUMMARY:${escape('DELWENFEST · Festival solidario Delwende')}`,
    `LOCATION:${escape(`${VENUE.name}, ${address}`)}`,
    `X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS="${address}";X-APPLE-RADIUS=60;X-TITLE="Entrada DELWENFEST (C/ Mª Rosa Molas)":geo:${lat},${lng}`,
    `GEO:${lat};${lng}`,
    `URL:${EVENT.url}`,
    `DESCRIPTION:${escape(description)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    ...alarms.flatMap((key) => {
      const a = ALARMS.find((x) => x.key === key)!;
      return ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escape(`DELWENFEST · ${a.label}`)}`, `TRIGGER:${a.trigger}`, 'END:VALARM'];
    }),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
