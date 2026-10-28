/*
 * Pantalla del bingo musical (/bingo). Todo lo compartido (premios, números que han
 * sonado y notas) vive en /api/bingo; se consulta cada pocos segundos y cada campo se
 * guarda por separado para que varias personas puedan editar a la vez sin pisarse.
 */

interface Cancion {
  n: number;
  titulo: string;
  artista: string;
  web: string;
  app: string;
  exacta: boolean;
}

type TipoPremio = 'principal' | 'pizza' | 'secundario';
interface Premio {
  id: number;
  tipo: TipoPremio;
  orden: number;
  titulo: string;
  premio: string;
  numero: number | null;
  criterio: string;
  ganador: string;
}
interface Estado {
  premios: Premio[];
  sonadas: number[];
  notas: string;
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const CANCIONES: Cancion[] = JSON.parse($('#canciones-data').textContent || '[]');
const porNumero = new Map(CANCIONES.map((c) => [c.n, c]));
const TOTAL = 90;

let estado: Estado = { premios: [], sonadas: [], notas: '' };
let cargado = false;

/* ------------------------------------------------------------------ */
/*  Red                                                                */
/* ------------------------------------------------------------------ */

const syncDot = $('[data-sync-dot]');
const syncTxt = $('[data-sync-txt]');
function conexion(ok: boolean, txt?: string) {
  syncDot.className = `size-2.5 rounded-full ${ok ? 'bg-forest' : 'bg-red'}`;
  syncTxt.textContent = txt ?? (ok ? 'En directo' : 'Sin conexión');
}

const toastEl = $('[data-toast]');
let toastT = 0;
function toast(txt: string) {
  toastEl.textContent = txt;
  toastEl.dataset.on = 'true';
  clearTimeout(toastT);
  toastT = window.setTimeout(() => (toastEl.dataset.on = 'false'), 2200);
}

async function enviar(datos: Record<string, unknown>) {
  try {
    const res = await fetch('/api/bingo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || 'Error');
    conexion(true);
    return out;
  } catch (err) {
    conexion(false);
    toast(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'No se pudo guardar');
    throw err;
  }
}

/* Cambios propios aún sin confirmar: no se pisan con lo que llega del servidor. */
const pendientes = new Map<string, number>();
const sonadasPendientes = new Map<number, boolean>();

async function refrescar() {
  if (document.hidden) return;
  try {
    const res = await fetch('/api/bingo', { cache: 'no-store' });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error);
    estado = out;
    cargado = true;
    conexion(true);
    pintarTodo();
  } catch (err) {
    conexion(false, err instanceof Error && err.message ? err.message : 'Sin conexión');
  }
}

/* ------------------------------------------------------------------ */
/*  Pestañas                                                           */
/* ------------------------------------------------------------------ */

const PESTANAS = ['canciones', 'premios', 'guia'];
function pestana() {
  const id = PESTANAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'canciones';
  $$('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== id));
  $$('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
}
window.addEventListener('hashchange', () => {
  pestana();
  window.scrollTo({ top: 0 });
});
pestana();

/* ------------------------------------------------------------------ */
/*  Canciones                                                          */
/* ------------------------------------------------------------------ */

const bola = $<HTMLInputElement>('#bola');
const ficha = $('[data-ficha]');
const btnSonar = $<HTMLButtonElement>('[data-sonar]');
let actual: number | null = null;

const sonadas = () => {
  const s = new Set(estado.sonadas);
  sonadasPendientes.forEach((v, n) => (v ? s.add(n) : s.delete(n)));
  return s;
};
const pizzaDe = (n: number) => estado.premios.find((p) => p.tipo === 'pizza' && p.numero === n);

function elegir(n: number | null, { foco = false } = {}) {
  actual = n !== null && n >= 1 && n <= TOTAL ? n : null;
  if (foco || document.activeElement !== bola) bola.value = actual ? String(actual) : '';
  pintarCancion();
  pintarTablero();
}

function pintarCancion() {
  const c = actual ? porNumero.get(actual) : undefined;
  $('[data-vacio]').classList.toggle('hidden', actual !== null);
  ficha.classList.toggle('hidden', !c);
  $('[data-falta]').classList.toggle('hidden', !actual || !!c);
  $('[data-falta-n]').textContent = String(actual ?? '');

  if (c) {
    $('[data-titulo]').textContent = c.titulo;
    $('[data-artista]').textContent = c.artista;
    $<HTMLAnchorElement>('[data-spotify]').href = c.web;
    $<HTMLAnchorElement>('[data-spotify-app]').href = c.app;
    $('[data-busqueda]').classList.toggle('hidden', c.exacta);
  }
  const pizza = actual ? pizzaDe(actual) : undefined;
  $('[data-pizza]').classList.toggle('hidden', !pizza);
  if (pizza) $('[data-pizza-txt]').textContent = `¡Canción pizza!${pizza.criterio ? ` · ${pizza.criterio}` : ''}`;

  const sonada = actual !== null && sonadas().has(actual);
  btnSonar.disabled = actual === null;
  $('[data-sonar-txt]').textContent = sonada ? `↺ Quitar la ${actual} de sonadas` : `✓ Marcar ${actual ?? ''} como sonada`;
}

function pintarTablero() {
  const s = sonadas();
  const pizzas = new Set(estado.premios.filter((p) => p.tipo === 'pizza' && p.numero).map((p) => p.numero));
  $$<HTMLButtonElement>('[data-tablero] button').forEach((b) => {
    const n = Number(b.dataset.n);
    b.setAttribute('aria-pressed', String(s.has(n)));
    b.dataset.actual = String(n === actual);
    b.dataset.pizza = String(pizzas.has(n));
    b.title = porNumero.get(n)?.titulo ?? '';
  });

  const orden = [...estado.sonadas.filter((n) => s.has(n)), ...[...s].filter((n) => !estado.sonadas.includes(n))];
  $('[data-cuenta]').textContent = String(s.size);
  $('[data-ultimas]').textContent = orden.length ? orden.slice(-6).reverse().join(' · ') : '—';

  const total = s.size;
  let pista =
    total === 0
      ? 'Pulsa un número para ver su canción.'
      : total < 18
        ? 'Calentando: la línea suele caer hacia la canción 28.'
        : total <= 36
          ? '👀 Zona de línea: atentos a que alguien cante.'
          : total < 58
            ? 'Entre medias: el bingo suele llegar entre la 60 y la 72.'
            : '🔥 Zona de bingo: comprobad cartones rápido.';
  if (pizzas.size) pista += ` · 🍕 ${[...pizzas].filter((n) => s.has(n as number)).length}/${pizzas.size} pizzas`;
  $('[data-pista]').textContent = pista;
}

bola.addEventListener('input', () => {
  bola.value = bola.value.replace(/\D/g, '').slice(0, 2);
  elegir(bola.value ? Number(bola.value) : null);
});
bola.addEventListener('focus', () => bola.select());
bola.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && actual) $<HTMLAnchorElement>('[data-spotify]').click();
});
$$('[data-paso]').forEach((b) =>
  b.addEventListener('click', () => {
    const n = (actual ?? 0) + Number(b.dataset.paso);
    elegir(Math.min(TOTAL, Math.max(1, n)), { foco: true });
  }),
);
$('[data-tablero]').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-n]');
  if (!b) return;
  elegir(Number(b.dataset.n), { foco: true });
  $('#canciones').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$$('[data-ir]').forEach((b) =>
  b.addEventListener('click', () => {
    elegir(Number(b.dataset.ir), { foco: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }),
);
const filtro = document.querySelector<HTMLInputElement>('[data-filtro]');
filtro?.addEventListener('input', () => {
  const q = filtro.value.trim().toLowerCase();
  $$('[data-item]').forEach((li) => (li.hidden = !!q && !li.dataset.item!.includes(q)));
});

async function marcar(n: number, sonada: boolean, aviso = true) {
  sonadasPendientes.set(n, sonada);
  pintarCancion();
  pintarTablero();
  try {
    await enviar({ accion: 'sonada', numero: n, sonada });
    if (sonada && !estado.sonadas.includes(n)) estado.sonadas.push(n);
    if (!sonada) estado.sonadas = estado.sonadas.filter((x) => x !== n);
    if (aviso) toast(sonada ? `La ${n} ha sonado` : `La ${n} vuelve al bombo`);
  } catch {
    /* el aviso ya sale en enviar() */
  } finally {
    sonadasPendientes.delete(n);
    pintarCancion();
    pintarTablero();
  }
}

btnSonar.addEventListener('click', () => {
  if (actual !== null) marcar(actual, !sonadas().has(actual));
});
// Abrir la canción en Spotify ya cuenta como que ha sonado: un toque menos en plena partida.
$('[data-spotify]').addEventListener('click', () => {
  if (actual !== null && !sonadas().has(actual)) marcar(actual, true, false);
});
$('[data-spotify-app]').addEventListener('click', () => {
  if (actual !== null && !sonadas().has(actual)) marcar(actual, true, false);
});

$('[data-nueva-partida]').addEventListener('click', async () => {
  if (!confirm('¿Empezar una partida nueva? Se desmarcan todos los números que han sonado.')) return;
  await enviar({ accion: 'nueva-partida' });
  estado.sonadas = [];
  elegir(null);
  toast('Partida nueva: bombo lleno');
});

/* ------------------------------------------------------------------ */
/*  Premios                                                            */
/* ------------------------------------------------------------------ */

interface CampoDef {
  campo: 'titulo' | 'premio' | 'numero' | 'criterio' | 'ganador';
  label: string;
  ph: string;
}
const CAMPOS: Record<TipoPremio, CampoDef[]> = {
  principal: [
    { campo: 'premio', label: 'Qué se regala', ph: 'Ej.: cesta, vale, camiseta…' },
    { campo: 'ganador', label: 'Ganador/a', ph: 'Nombre o nº de cartón' },
  ],
  pizza: [
    { campo: 'numero', label: 'Nº de canción', ph: '1–90' },
    { campo: 'criterio', label: 'Criterio', ph: 'Quién se la lleva' },
    { campo: 'ganador', label: 'Ganador/a', ph: 'Mesa o nombre' },
  ],
  secundario: [
    { campo: 'titulo', label: 'Premio', ph: 'Qué se regala' },
    { campo: 'criterio', label: 'Cuándo o cómo se gana', ph: 'Ej.: el primero en bailar…' },
    { campo: 'ganador', label: 'Ganador/a', ph: 'Nombre o nº de cartón' },
  ],
};

const temporizadores = new Map<string, number>();
function guardarCampo(p: Premio, campo: CampoDef['campo'], valor: string) {
  const clave = `${p.id}:${campo}`;
  pendientes.set(clave, (pendientes.get(clave) ?? 0) + 1);
  clearTimeout(temporizadores.get(clave));
  temporizadores.set(
    clave,
    window.setTimeout(async () => {
      try {
        await enviar({ accion: 'premio', id: p.id, campo, valor });
        (p as unknown as Record<string, unknown>)[campo] = campo === 'numero' ? (valor ? Number(valor) : null) : valor;
        syncTxt.textContent = 'Guardado ✓';
      } finally {
        pendientes.delete(clave);
        if (campo === 'numero') {
          pintarCancion();
          pintarTablero();
        }
      }
    }, 500),
  );
}

function tarjeta(p: Premio, i: number) {
  const card = document.createElement('article');
  card.className = `sticker rounded-[1.75rem] p-5 ${p.tipo === 'principal' && i === 0 ? 'card-gold' : 'bg-cream'}`;
  card.dataset.id = String(p.id);

  const cab = document.createElement('div');
  cab.className = 'flex items-center justify-between gap-3';
  const h = document.createElement('h3');
  h.className = 'font-display text-2xl uppercase';
  h.textContent = p.tipo === 'pizza' ? `🍕 Pizza ${i + 1}` : p.tipo === 'secundario' ? `Secundario ${i + 1}` : p.titulo;
  cab.append(h);
  if (p.tipo === 'secundario') {
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'rounded-full border-2 border-ink px-3 pt-1 pb-0.5 text-sm';
    quitar.textContent = 'Quitar';
    quitar.addEventListener('click', async () => {
      if (!confirm('¿Quitar este premio?')) return;
      await enviar({ accion: 'borrar-premio', id: p.id });
      estado.premios = estado.premios.filter((x) => x.id !== p.id);
      pintarPremios(true);
    });
    cab.append(quitar);
  }
  card.append(cab);

  for (const def of CAMPOS[p.tipo]) {
    const label = document.createElement('label');
    label.className = 'mt-3 block';
    const span = document.createElement('span');
    span.className = 'mb-1 block text-sm font-bold text-ink/70';
    span.textContent = def.label;
    const input = document.createElement('input');
    input.className = 'campo';
    input.placeholder = def.ph;
    input.dataset.campo = def.campo;
    if (def.campo === 'numero') {
      input.inputMode = 'numeric';
      input.maxLength = 2;
    }
    input.value = String(p[def.campo] ?? '');
    input.addEventListener('input', () => {
      if (def.campo === 'numero') {
        input.value = input.value.replace(/\D/g, '').slice(0, 2);
        if (input.value && (Number(input.value) < 1 || Number(input.value) > TOTAL)) return;
        pintarNombreCancion(card, input.value);
      }
      guardarCampo(p, def.campo, input.value);
    });
    label.append(span, input);
    card.append(label);
    if (def.campo === 'numero') {
      const nombre = document.createElement('p');
      nombre.className = 'mt-1 text-sm text-ink/60';
      nombre.dataset.nombreCancion = '';
      card.append(nombre);
    }
  }
  pintarNombreCancion(card, String(p.numero ?? ''));
  return card;
}

function pintarNombreCancion(card: HTMLElement, valor: string) {
  const el = card.querySelector<HTMLElement>('[data-nombre-cancion]');
  if (!el) return;
  const c = porNumero.get(Number(valor));
  el.textContent = c ? `${c.titulo} · ${c.artista}` : valor ? 'Sin canción en la lista todavía' : '';
}

let firma = '';
function pintarPremios(forzar = false) {
  const nueva = estado.premios.map((p) => p.id).join(',');
  const listas = $$('[data-lista-premios]');
  if (forzar || nueva !== firma) {
    firma = nueva;
    for (const lista of listas) {
      const tipo = lista.dataset.listaPremios as TipoPremio;
      const fragment = document.createDocumentFragment();
      estado.premios.filter((p) => p.tipo === tipo).forEach((p, i) => fragment.append(tarjeta(p, i)));
      // Conserva el foco si alguien está escribiendo justo cuando cambia la lista
      const activo = document.activeElement as HTMLInputElement | null;
      const foco = activo && lista.contains(activo) ? [activo.closest<HTMLElement>('[data-id]')?.dataset.id, activo.dataset.campo] : null;
      lista.replaceChildren(fragment);
      if (foco) lista.querySelector<HTMLInputElement>(`[data-id="${foco[0]}"] [data-campo="${foco[1]}"]`)?.focus();
    }
    return;
  }
  // Misma lista: solo actualiza los campos que nadie está tocando aquí
  for (const p of estado.premios) {
    const card = document.querySelector<HTMLElement>(`[data-lista-premios] [data-id="${p.id}"]`);
    if (!card) continue;
    card.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((input) => {
      const campo = input.dataset.campo as CampoDef['campo'];
      if (input === document.activeElement || pendientes.has(`${p.id}:${campo}`)) return;
      const v = String(p[campo] ?? '');
      if (input.value !== v) {
        input.value = v;
        if (campo === 'numero') pintarNombreCancion(card, v);
      }
    });
  }
}

$$('[data-nuevo-premio]').forEach((b) =>
  b.addEventListener('click', async () => {
    const { premio } = await enviar({ accion: 'nuevo-premio', tipo: b.dataset.nuevoPremio });
    estado.premios.push(premio);
    pintarPremios(true);
    document.querySelector<HTMLInputElement>(`[data-id="${premio.id}"] input`)?.focus();
  }),
);

/* ------------------------------------------------------------------ */
/*  Notas                                                              */
/* ------------------------------------------------------------------ */

const notas = $<HTMLTextAreaElement>('[data-notas]');
const notasEstado = $('[data-notas-estado]');
let notasT = 0;
notas.addEventListener('input', () => {
  pendientes.set('notas', 1);
  notasEstado.textContent = 'Guardando…';
  clearTimeout(notasT);
  notasT = window.setTimeout(async () => {
    try {
      await enviar({ accion: 'notas', texto: notas.value });
      estado.notas = notas.value;
      notasEstado.textContent = 'Guardado ✓';
    } catch {
      notasEstado.textContent = 'No se pudo guardar: sigue escrito aquí.';
    } finally {
      pendientes.delete('notas');
    }
  }, 800);
});

function pintarNotas() {
  if (document.activeElement === notas || pendientes.has('notas')) return;
  if (notas.value !== estado.notas) notas.value = estado.notas;
}

/* ------------------------------------------------------------------ */
/*  Guía: calculadora de tiempos                                       */
/* ------------------------------------------------------------------ */

// Canción media y rango habitual (10.º–90.º percentil) de 20.000 partidas simuladas.
const DATOS: Record<number, Record<'L1' | 'L2' | 'L3' | 'B', [number, number, number]>> = {
  100: { L1: [28.3, 21, 36], L2: [33.5, 27, 39], L3: [36.6, 31, 42], B: [66.5, 60, 72] },
  200: { L1: [24.9, 18, 31], L2: [29.4, 24, 35], L3: [32.1, 28, 37], B: [63.8, 58, 69] },
};
const NOMBRES = { L1: 'Línea', L2: '2.ª línea', L3: '3.ª línea', B: 'Bingo' };
let cartones = 100;
const frag = $<HTMLInputElement>('[data-frag]');
const pausa = $<HTMLInputElement>('[data-pausa]');
const mmss = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
const min = (s: number) => Math.round(s / 60);

function calcular() {
  const seg = Number(frag.value) + Number(pausa.value);
  $('[data-frag-v]').textContent = `${frag.value} s`;
  $('[data-pausa-v]').textContent = `${pausa.value} s`;
  const d = DATOS[cartones];
  $('[data-hitos]').replaceChildren(
    ...(Object.keys(NOMBRES) as (keyof typeof NOMBRES)[]).map((k) => {
      const [m, a, b] = d[k];
      const div = document.createElement('div');
      div.className = `rounded-2xl border-l-8 bg-mint-light p-4 ${k === 'B' ? 'border-red' : 'border-amber'}`;
      div.innerHTML = `<p class="font-display text-xl uppercase">${NOMBRES[k]}</p>
        <p class="font-display text-4xl leading-none tabular-nums">${mmss(m * seg)}</p>
        <p class="mt-1 text-sm text-ink/70">hacia la canción ${Math.round(m)}<br>normalmente entre el min ${min(a * seg)} y el ${min(b * seg)}</p>`;
      return div;
    }),
  );
  $('[data-tira]').replaceChildren(
    ...Array.from({ length: TOTAL }, (_, i) => {
      const x = document.createElement('i');
      const n = i + 1;
      if (n >= d.B[1] && n <= d.B[2]) x.className = 'b';
      else if (n >= d.L1[1] && n <= d.L3[2]) x.className = 'l';
      return x;
    }),
  );
}
$$<HTMLButtonElement>('[data-cartones]').forEach((b) =>
  b.addEventListener('click', () => {
    cartones = Number(b.dataset.cartones);
    $$('[data-cartones]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    calcular();
  }),
);
frag.addEventListener('input', calcular);
pausa.addEventListener('input', calcular);
calcular();

/* ------------------------------------------------------------------ */
/*  Arranque                                                           */
/* ------------------------------------------------------------------ */

function pintarTodo() {
  if (!cargado) return;
  pintarCancion();
  pintarTablero();
  pintarPremios();
  pintarNotas();
}

pintarCancion();
pintarTablero();
refrescar();
setInterval(refrescar, 4000);
document.addEventListener('visibilitychange', refrescar);
