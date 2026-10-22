/*
 * Información oficial de Delwende. Fuentes: delwende.es (identidad, proyecto de
 * Atakpamé, hazte socio) e Informe de Transparencia de Fundación Lealtad (mayo de
 * 2025, cuentas auditadas de 2023).
 */

export const DELWENDE_URLS = {
  web: 'https://delwende.es/',
  identity: 'https://delwende.es/identidad/',
  project: 'https://delwende.es/proyectos/centro-de-promocion-social-de-la-mujer-en-atakpame-togo/',
  member: 'https://delwende.es/colabora/hazte-socio/',
};

export const ONGD = {
  tagline: 'Al servicio de la vida',
  origin:
    'Delwende nace en 1997 a iniciativa de personas vinculadas a las Hermanas de Nuestra Señora de la Consolación, para colaborar en proyectos educativos y sanitarios de cooperación al desarrollo y de acción social.',
  mission:
    'Ser cauce «Al servicio de la Vida» cooperando al desarrollo integral de las personas más vulnerables, para procurar su progreso y que sean agentes de su propio cambio y de transformación social.',
  how: 'Se gestiona íntegramente con voluntariado y trabaja con las delegaciones de las Hermanas de la Consolación en España. Sobre el terreno, los proyectos los llevan a cabo las propias Hermanas.',
  areas: [
    { title: 'Cooperación al desarrollo', text: 'Educación, alfabetización, nutrición y salud en África, Latinoamérica y Asia.' },
    { title: 'Emergencias', text: 'Apoyo a poblaciones que sufren las consecuencias de catástrofes naturales.' },
    { title: 'Acción social', text: 'En España, sobre todo con mujeres en situación de vulnerabilidad y menores.' },
  ],
  // Fundación Lealtad, cuentas auditadas de 2023
  facts: [
    { value: '12.717', label: 'personas beneficiarias' },
    { value: '1.813', label: 'socios y socias' },
    { value: '224', label: 'voluntarios' },
    { value: '94,4 %', label: 'del gasto va a la misión' },
  ],
  photos: ['Delwende en el terreno', 'Voluntariado de Delwende'],
};

/** Contenido ampliado para el modal «Leer más» del proyecto. */
export const PROJECT_MORE = {
  title: 'Centro de Promoción Social de la Mujer',
  place: 'Atakpamé · Togo',
  paragraphs: [
    'El centro, que lleva el nombre de María Rosa Molas —fundadora de las Hermanas de la Consolación—, acompaña la formación integral de adolescentes y mujeres jóvenes que nunca pudieron ir a la escuela.',
    'Durante tres años, las alumnas aprenden a leer y escribir y se forman en un oficio, peluquería o costura, además de recibir educación sanitaria, cultural y sobre gestión de cooperativas. Es una oportunidad real para ganarse la vida y construir su propio futuro.',
    'Delwende está unida a este proyecto desde sus orígenes: en 1999 ayudó a adquirir el terreno donde se construyó el centro, y hoy colabora con su mantenimiento. Lo gestionan sobre el terreno las Hermanas de la Consolación.',
  ],
  highlights: [
    { value: '1999', label: 'Delwende ayuda a comprar el terreno' },
    { value: '3 años', label: 'de formación por alumna' },
    { value: '2 oficios', label: 'peluquería y costura' },
  ],
  photo: 'Alumnas del centro de Atakpamé',
};

export const MEMBERSHIP = {
  intro:
    'El DelwenFest dura una tarde. Si te haces socio o socia, tu ayuda llega a proyectos como el de Atakpamé todo el año. Y además desgrava.',
  perks: [
    'Delwende está acogida a la Ley 49/2002 de mecenazgo: tu cuota desgrava en la renta.',
    'Para aplicar la deducción solo hace falta tu NIF al darte de alta.',
    'Tu cuota sostiene los proyectos de Delwende en África, Latinoamérica, Asia y España.',
  ],
  amounts: [5, 10, 15, 25, 50],
  defaultAmount: 10,
};
