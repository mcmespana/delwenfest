/*
 * Contenido de las secciones de Delwende (ONGD, proyecto y hazte socio).
 * TODO: todo lo marcado como LOREM o FOTO es provisional hasta recibir los textos e
 * imágenes definitivos de Delwende. Estas secciones solo se ven entrando con ?borrador.
 */

export const LOREM = {
  short: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  medium:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo eget magna fermentum iaculis eu non diam. Phasellus vestibulum lorem sed risus ultricies tristique.',
  long: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
};

export const ONGD = {
  tagline: 'Al servicio de la vida',
  history: [LOREM.long, LOREM.medium],
  mission: LOREM.medium,
  facts: [
    { value: '00', label: 'años de trayectoria' },
    { value: '00', label: 'proyectos en marcha' },
    { value: '00', label: 'países' },
  ],
  values: ['Lorem', 'Ipsum dolor', 'Sit amet', 'Consectetur'],
  photos: ['Equipo de Delwende', 'Comunidad en Togo', 'Voluntariado'],
};

export const PROJECT_CHAPTERS = [
  { kicker: '01 · El contexto', title: 'Atakpamé, Togo', text: LOREM.medium, photo: 'Atakpamé / entorno del centro' },
  { kicker: '02 · El centro', title: 'Centro de Promoción Social de la Mujer', text: LOREM.medium, photo: 'Fachada o aulas del centro' },
  { kicker: '03 · La formación', title: 'Alfabetización, costura y peluquería', text: LOREM.medium, photo: 'Taller de costura' },
  { kicker: '04 · Las alumnas', title: '85 jóvenes de 15 a 25 años', text: LOREM.medium, photo: 'Alumnas del centro' },
  { kicker: '05 · El futuro', title: 'Cooperativas y nuevas oportunidades', text: LOREM.medium, photo: 'Cooperativa / salida laboral' },
];

export const PROJECT_BUDGET = [
  { label: 'Partida 1 · Lorem ipsum', pct: 'XX %' },
  { label: 'Partida 2 · Dolor sit amet', pct: 'XX %' },
  { label: 'Partida 3 · Consectetur', pct: 'XX %' },
  { label: 'Partida 4 · Adipiscing elit', pct: 'XX %' },
];

export const PROJECT_QUOTE = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo eget magna fermentum iaculis.',
  author: 'Nombre Apellido',
  role: 'Alumna del centro · Atakpamé',
};

export const MEMBERSHIP = {
  intro: LOREM.medium,
  perks: [LOREM.short, 'Sed do eiusmod tempor incididunt ut labore.', 'Ut enim ad minim veniam, quis nostrud.'],
  // TODO: enlace al formulario real de alta de socios/as de Delwende
  formUrl: '#',
  amounts: [5, 10, 15, 25, 50],
  defaultAmount: 10,
};
