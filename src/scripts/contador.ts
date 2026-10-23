/*
 * Pantalla del contador: pregunta el total cada 2 s y, cuando sube, celebra y suena.
 */
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { Campanero } from './sonidos';
import { celebrar, esHito, type Fx } from './celebraciones';

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;

const numero = $('[data-numero]');
const caja = $('[data-caja]');
const inicio = $('[data-inicio]');
const punto = $('[data-punto]');
const qr = $('[data-qr]');
const mandos = $('[data-mandos]');
const avisoSonido = $<HTMLButtonElement>('[data-aviso-sonido]');

function ponerNumero(n: number) {
  const txt = String(Math.max(0, n));
  if (numero.textContent !== txt) numero.textContent = txt;
  caja.style.setProperty('--d', String(txt.length));
}

const fx: Fx = {
  numero,
  escena: $('[data-escena]'),
  capa: $('[data-fx]'),
  destello: $('[data-destello]'),
  confeti: confetti.create($<HTMLCanvasElement>('[data-confeti]'), { resize: true, useWorker: true }),
  ponerNumero,
};

const campanero = new Campanero();

let arrancado = false;
let mostrado: number | null = null; // lo que se ve ahora
let objetivo = 0; // lo último que dice el servidor
let sonido = 'carillon';
let ultimoPing: number | null = null;
let pruebas = 0;
let ocupado = false;

/* ------------------------------------------------------------------ */
/*  Cola de celebraciones                                              */
/* ------------------------------------------------------------------ */

function sonar(hito: boolean) {
  if (!campanero.tocar(sonido, hito)) avisoSonido.hidden = false;
}

async function correr() {
  if (ocupado || mostrado === null) return;
  ocupado = true;
  try {
    while (true) {
      if (objetivo > mostrado) {
        const de = mostrado;
        const a = objetivo;
        mostrado = a;
        if (!arrancado) {
          ponerNumero(a);
          continue;
        }
        sonar(esHito(de, a));
        await celebrar(fx, de, a);
      } else if (pruebas > 0) {
        pruebas = 0;
        if (!arrancado) continue;
        sonar(false);
        await celebrar(fx, mostrado, mostrado);
      } else if (objetivo < mostrado) {
        // Han borrado alguno: baja sin fiesta
        const o = { v: mostrado };
        mostrado = objetivo;
        await gsap.to(o, { v: objetivo, duration: 0.8, ease: 'power2.out', onUpdate: () => ponerNumero(Math.round(o.v)) });
      } else break;
    }
  } finally {
    ocupado = false;
  }
}

/* ------------------------------------------------------------------ */
/*  Datos                                                              */
/* ------------------------------------------------------------------ */

let fallos = 0;

async function leer() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch('/api/contador', { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    const d: { total: number; sonido: string; ping: number; qr: boolean } = await res.json();
    fallos = 0;
    punto.dataset.mal = 'false';

    sonido = d.sonido;
    qr.hidden = !d.qr;
    objetivo = d.total;
    if (mostrado === null) {
      mostrado = d.total;
      ponerNumero(d.total);
    }
    if (ultimoPing !== null && d.ping !== ultimoPing) pruebas++;
    ultimoPing = d.ping;
    correr();
  } catch {
    if (++fallos >= 2) punto.dataset.mal = 'true';
  }
}

let temporizador = 0;
function bucle() {
  clearTimeout(temporizador);
  leer().finally(() => (temporizador = window.setTimeout(bucle, 2000)));
}
bucle();

/* ------------------------------------------------------------------ */
/*  Arranque, pantalla encendida y sonido                              */
/* ------------------------------------------------------------------ */

type ConWakeLock = Navigator & { wakeLock?: { request: (t: 'screen') => Promise<unknown> } };

async function mantenerEncendida() {
  try {
    await (navigator as ConWakeLock).wakeLock?.request('screen');
  } catch {
    /* sin Wake Lock: que pongan Bloqueo automático en «Nunca» */
  }
}

type DocFS = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type ElFS = HTMLElement & { webkitRequestFullscreen?: () => void };

function pantallaCompleta() {
  const doc = document as DocFS;
  const el = document.documentElement as ElFS;
  try {
    if (doc.fullscreenElement || doc.webkitFullscreenElement) (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else el.webkitRequestFullscreen?.();
  } catch {
    /* iPad sin pantalla completa: mejor desde «Añadir a pantalla de inicio» */
  }
}

$('[data-empezar]').addEventListener('click', async () => {
  await campanero.desbloquear();
  arrancado = true;
  pantallaCompleta();
  mantenerEncendida();
  gsap.to(inicio, { opacity: 0, duration: 0.4, onComplete: () => (inicio.hidden = true) });
  campanero.tocar(sonido);
  avisoSonido.hidden = campanero.activo;
});

avisoSonido.addEventListener('click', async () => {
  avisoSonido.hidden = await campanero.desbloquear();
  if (campanero.activo) campanero.tocar(sonido);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  mantenerEncendida();
  bucle();
  if (arrancado) campanero.reanudar().then((ok) => (avisoSonido.hidden = ok));
});

// Si iOS corta el audio (llamada, bloqueo…), se intenta reanudar y si no, se avisa
setInterval(() => {
  if (arrancado && !campanero.activo) campanero.reanudar().then((ok) => (avisoSonido.hidden = ok));
}, 10000);

/* ------------------------------------------------------------------ */
/*  Mandos ocultos                                                     */
/* ------------------------------------------------------------------ */

let ocultar = 0;
document.addEventListener('pointerdown', (e) => {
  if (!arrancado || (e.target as HTMLElement).closest('button')) return;
  mandos.dataset.visible = 'true';
  clearTimeout(ocultar);
  ocultar = window.setTimeout(() => (mandos.dataset.visible = 'false'), 4000);
});

mandos.addEventListener('click', (e) => {
  const accion = (e.target as HTMLElement).closest<HTMLElement>('[data-accion]')?.dataset.accion;
  if (accion === 'pantalla') pantallaCompleta();
  if (accion === 'probar') {
    pruebas++;
    correr();
  }
});
