import type { ImageMetadata } from 'astro';

import balon from '../assets/illus/balon.webp';
import bebidas from '../assets/illus/bebidas.webp';
import bingo from '../assets/illus/bingo.webp';
import camiseta from '../assets/illus/camiseta.webp';
import confeti from '../assets/illus/confeti.webp';
import foodtruck from '../assets/illus/foodtruck.webp';
import hinchable from '../assets/illus/hinchable.webp';
import micro from '../assets/illus/micro.webp';
import regalo from '../assets/illus/regalo.webp';
import ticket from '../assets/illus/ticket.webp';
import toro from '../assets/illus/toro.webp';
import vales from '../assets/illus/vales.webp';

import argot from '../assets/sponsors/argot.webp';
import balmaNavarro from '../assets/sponsors/balma-navarro.webp';
import cardamomo from '../assets/sponsors/cardamomo.webp';
import esteticaSilvia from '../assets/sponsors/estetica-silvia.webp';
import farmaciaMartinez from '../assets/sponsors/farmacia-martinez.webp';
import farmaciaSanchis from '../assets/sponsors/farmacia-sanchis.webp';
import fundacioAlbinegra from '../assets/sponsors/fundacio-albinegra.webp';
import grupoPardo from '../assets/sponsors/grupo-pardo.webp';
import letrusco from '../assets/sponsors/letrusco.webp';
import montecristo from '../assets/sponsors/montecristo.webp';
import perezMateu from '../assets/sponsors/perez-mateu.webp';
import planetFootball from '../assets/sponsors/planet-football.webp';
import ramirez from '../assets/sponsors/ramirez.webp';
import sinbikiniLogo from '../assets/sponsors/sinbikini.webp';
import stylor from '../assets/sponsors/stylor.webp';
import adsuara from '../assets/sponsors/adsuara.webp';
import vertigoBowling from '../assets/sponsors/vertigo-bowling.webp';
import vertigoPark from '../assets/sponsors/vertigo-park.webp';
import vjump from '../assets/sponsors/vjump.webp';

import ajuntament from '../assets/partners/ajuntament-castello.webp';
import castellonJuventud from '../assets/partners/castellon-juventud.webp';
import fundacionConsolacion from '../assets/partners/fundacion-consolacion.webp';
import gvaIvaj from '../assets/partners/gva-ivaj.webp';

/* ------------------------------------------------------------------ */
/*  Datos generales del evento                                         */
/* ------------------------------------------------------------------ */

export const EVENT = {
  name: 'DELWENFEST',
  tagline: 'El festival solidario de la ONGD Delwende',
  dateLabel: '30 octubre 2026',
  weekday: 'Viernes',
  // 30/10/2026 ya es horario de invierno (CET, UTC+1)
  start: '2026-10-30T17:15:00+01:00',
  end: '2026-10-30T22:30:00+01:00',
  timeLabel: '17:15 – 22:30',
  // Desde esta hora la portada destaca cómo hacerse socio/a (lleva a /hazte-socio, el QR)
  socioDesde: '2026-10-30T16:00:00+01:00',
  donation: '2 €',
  url: import.meta.env.SITE.replace(/\/$/, ''),
} as const;

export const VENUE = {
  name: 'Colegio Consolación Castellón',
  street: 'Avda. Virgen de Lidón, 49',
  city: '12004 Castellón de la Plana',
  entrance: 'Entrada por C/ Mª Rosa Molas',
  entranceHint: 'delante del Carrefour Express',
  // Puerta de C/ Santa María Rosa Molas, frente al Carrefour Express
  entranceCoords: [39.99179, -0.03084] as [number, number],
  schoolCoords: [39.99116, -0.03146] as [number, number],
  carrefourCoords: [39.99189, -0.03066] as [number, number],
};

const dest = `${VENUE.entranceCoords[0]},${VENUE.entranceCoords[1]}`;

export const DIRECTIONS = {
  google: `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`,
  apple: `https://maps.apple.com/?daddr=${dest}&q=${encodeURIComponent('Entrada DELWENFEST · C/ Mª Rosa Molas')}`,
  waze: `https://waze.com/ul?ll=${dest}&navigate=yes`,
};

const calDetails = [
  'Festival solidario a beneficio de la ONGD Delwende.',
  'Juegos, food trucks, bingo musical, premios, rifa, música en directo con Sinbikini, Rodhel Show DJ, toro mecánico e hinchables.',
  `Entrada por C/ Mª Rosa Molas (delante del Carrefour Express).`,
  EVENT.url,
].join('\n');

export const CALENDAR = {
  google:
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent('DELWENFEST · Festival solidario Delwende')}` +
    '&dates=20261030T171500/20261030T223000&ctz=Europe/Madrid' +
    `&details=${encodeURIComponent(calDetails)}` +
    `&location=${encodeURIComponent(`${VENUE.name}, ${VENUE.street}, ${VENUE.city}`)}`,
  ics: '/delwenfest.ics',
};

export const SOCIAL = [
  { handle: 'mcmcastellon', label: '@mcmcastellon', url: 'https://www.instagram.com/mcmcastellon/' },
  { handle: 'delwende_ongd', label: '@delwende_ongd', url: 'https://www.instagram.com/delwende_ongd/' },
];

/* ------------------------------------------------------------------ */
/*  Horario (actualizado: DJ 20:30 y cierre 22:30)                     */
/* ------------------------------------------------------------------ */

export type Slot = {
  time: string;
  title: string;
  kicker: string;
  text: string;
  tone: 'red' | 'coral' | 'amber';
  img?: ImageMetadata;
};

export const SCHEDULE: Slot[] = [
  {
    time: '17:15',
    title: 'Bienvenida',
    kicker: 'Abrimos puertas',
    text: 'Arranca el DelwenFest. Ven pronto, saluda y prepárate para una tarde muy grande.',
    tone: 'red',
    img: confeti,
  },
  {
    time: '17:45',
    title: 'Bingo musical',
    kicker: 'Escucha, adivina y… ¡bingo!',
    text: 'El bingo de siempre, pero con canciones. Afina el oído y tacha más rápido que nadie.',
    tone: 'red',
    img: bingo,
  },
  {
    time: '19:00',
    title: 'Sinbikini',
    kicker: 'Música en directo',
    text: 'Concierto en directo con el sonido fresco y mediterráneo de Sinbikini.',
    tone: 'coral',
    img: micro,
  },
  {
    time: '20:00',
    title: 'Rifa',
    kicker: 'Muchos premios',
    text: 'Llega el momento de los premios. Ten tu papeleta a mano y cruza los dedos.',
    tone: 'coral',
    img: ticket,
  },
  {
    time: '20:30',
    title: 'Rodhel Show',
    kicker: 'DJ',
    text: 'Rodhel Show se pone a los platos para que nadie se quede sin bailar.',
    tone: 'amber',
  },
  {
    time: '22:30',
    title: 'Final',
    kicker: 'Cerramos la fiesta',
    text: 'Último baile y a casa con el corazón lleno. ¡Gracias por sumar!',
    tone: 'amber',
    img: regalo,
  },
];

/* ------------------------------------------------------------------ */
/*  Todo el plan                                                       */
/* ------------------------------------------------------------------ */

export type Activity = {
  id: string;
  title: string;
  text: string;
  tag?: string;
  imgs: { src: ImageMetadata; alt: string; cls: string }[];
  theme: string;
  span: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: 'juegos',
    title: 'Juegos',
    text: 'Juegos y retos para pasarlo en grande toda la tarde.',
    imgs: [
      { src: balon, alt: 'Balón de fútbol', cls: 'w-[42%] -right-[6%] -top-[14%] rotate-12' },
      { src: camiseta, alt: 'Camiseta albinegra', cls: 'w-[34%] right-[30%] -bottom-[10%] -rotate-12' },
    ],
    theme: 'card-sunset',
    span: 'md:col-span-2',
  },
  {
    id: 'food',
    title: 'Food trucks',
    text: 'Comida y bebida para aguantar toda la tarde.',
    tag: 'Comida y bebida',
    imgs: [
      { src: foodtruck, alt: 'Food truck de perritos calientes', cls: 'w-[78%] max-md:!w-[62%] -right-[8%] -bottom-[6%]' },
      { src: bebidas, alt: 'Bebidas', cls: 'w-[30%] left-[4%] -bottom-[4%] -rotate-6' },
    ],
    theme: 'card-lagoon',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 'bingo',
    title: 'Bingo musical',
    text: 'Canciones en lugar de números. A las 17:45.',
    tag: '17:45',
    imgs: [{ src: bingo, alt: 'Cartón de bingo', cls: 'w-[46%] -right-[6%] -top-[10%] rotate-6' }],
    theme: 'card-candy',
    span: '',
  },
  {
    id: 'premios',
    title: 'Premios y rifa',
    text: 'Muchos premios y una rifa a las 20:00.',
    tag: '20:00',
    imgs: [
      { src: regalo, alt: 'Regalo', cls: 'w-[40%] -right-[4%] -top-[14%] rotate-6' },
      { src: vales, alt: 'Vales regalo', cls: 'w-[44%] right-[22%] -bottom-[12%] -rotate-12' },
    ],
    theme: 'card-gold',
    span: '',
  },
  {
    id: 'musica',
    title: 'Música en directo',
    text: 'Sinbikini en directo y Rodhel Show a los platos.',
    tag: '19:00 · 20:30',
    imgs: [{ src: micro, alt: 'Micrófono', cls: 'w-[44%] -right-[4%] -top-[12%] rotate-6' }],
    theme: 'card-night',
    span: 'md:col-span-2',
  },
  {
    id: 'toro',
    title: 'Toro mecánico',
    text: '¿Cuánto aguantas encima? Solo hay una forma de saberlo.',
    imgs: [{ src: toro, alt: 'Toro mecánico', cls: 'w-[62%] -right-[8%] -bottom-[8%]' }],
    theme: 'card-coral',
    span: '',
  },
  {
    id: 'hinchables',
    title: 'Hinchables',
    text: 'Saltos, toboganes y risas aseguradas.',
    imgs: [{ src: hinchable, alt: 'Castillo hinchable', cls: 'w-[70%] -right-[10%] -bottom-[8%]' }],
    theme: 'card-lime',
    span: '',
  },
];

/* ------------------------------------------------------------------ */
/*  Colaboradores                                                      */
/* ------------------------------------------------------------------ */

export type Sponsor = { name: string; kind: string; logo: ImageMetadata; bg: string; dark?: boolean; instagram?: string };

export const SPONSORS: Sponsor[] = [
  {
    name: 'Panadería Pastelería Adsuara',
    kind: 'Panadería y pastelería',
    logo: adsuara,
    bg: '#f5b50b',
    instagram: 'https://www.instagram.com/panaderiaadsuara/',
  },
  { name: 'Vertigo Bowling Estepark', kind: 'Bowling', logo: vertigoBowling, bg: '#2f6bd8' },
  { name: 'Planet Football Indoor', kind: 'Fútbol indoor', logo: planetFootball, bg: '#f7363a' },
  { name: 'Sinbikini', kind: 'Fresh music · Mediterranean beach', logo: sinbikiniLogo, bg: '#ffae34' },
  { name: 'Montecristo', kind: 'Restaurant & Pizzería', logo: montecristo, bg: '#24211e', dark: true },
  { name: "L'Etrusco", kind: 'Colaborador', logo: letrusco, bg: '#1fb3b0' },
  { name: 'Vertigo Park', kind: 'Colaborador', logo: vertigoPark, bg: '#f5b50b' },
  { name: 'Argot', kind: 'Colaborador', logo: argot, bg: '#f87341' },
  { name: 'Balma Navarro', kind: 'Salón de uñas', logo: balmaNavarro, bg: '#f0a3b8' },
  { name: 'Centro de Estética y Masajes Silvia', kind: 'Estética y masajes', logo: esteticaSilvia, bg: '#8cc63f' },
  { name: "Styl'or", kind: 'Colaborador', logo: stylor, bg: '#b28ce8' },
  { name: 'VJump', kind: 'Colaborador', logo: vjump, bg: '#1d8462' },
  { name: 'Farmacia Inmaculada Martínez Gómez', kind: 'Farmacia', logo: farmaciaMartinez, bg: '#f7363a' },
  { name: 'Fundació Albinegra', kind: 'Fundació', logo: fundacioAlbinegra, bg: '#24211e', dark: true },
  { name: 'Ramírez', kind: 'Horchata natural y granizados', logo: ramirez, bg: '#ffae34' },
  { name: 'Farmacia Sanchis', kind: 'Farmacia', logo: farmaciaSanchis, bg: '#1fb3b0' },
  { name: 'Cardamomo', kind: 'Tu mejor selección', logo: cardamomo, bg: '#f87341' },
  { name: 'Pérez y Mateu', kind: 'Asesores vinícolas', logo: perezMateu, bg: '#b28ce8' },
  { name: 'Grupo Pardo', kind: 'Colaborador', logo: grupoPardo, bg: '#2f6bd8' },
];

export const INSTITUTIONS = [
  { name: 'Generalitat Valenciana · IVAJ Institut Valencià de la Joventut', logo: gvaIvaj, w: 'w-56' },
  { name: 'Ajuntament de Castelló', logo: ajuntament, w: 'w-36' },
  { name: 'Castellón Juventud', logo: castellonJuventud, w: 'w-40' },
  { name: 'Fundación Educativa Consolación Castellón', logo: fundacionConsolacion, w: 'w-36' },
];

/* ------------------------------------------------------------------ */
/*  Proyecto Delwende                                                  */
/* ------------------------------------------------------------------ */

export const CAUSE = {
  project: 'Centro de Promoción Social de la Mujer',
  place: 'Atakpamé (Togo)',
  intro:
    'El centro ofrece a jóvenes que no han tenido acceso a la escolarización una oportunidad para aprender, formarse y construir su futuro.',
  learn: [
    'Alfabetización',
    'Costura',
    'Peluquería',
    'Educación sanitaria',
    'Formación cultural',
    'Gestión de cooperativas',
  ],
  distanceKm: 3611,
};
