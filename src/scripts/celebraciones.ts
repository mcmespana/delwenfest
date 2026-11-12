/*
 * Celebraciones del contador: cada socio/a nuevo dispara una distinta (sin repetir
 * seguidas) y las decenas tienen la suya propia. Todo con transform/opacity y confeti
 * en canvas para que el iPad vaya fluido con batería.
 */
import gsap from 'gsap';
import type confetti from 'canvas-confetti';

export type Fx = {
  numero: HTMLElement;
  escena: HTMLElement;
  capa: HTMLElement;
  destello: HTMLElement;
  confeti: confetti.CreateTypes;
  ponerNumero: (n: number) => void;
};

const COLORES = ['#f7363a', '#f5b50b', '#8cc63f', '#1fb3b0', '#f87341', '#f0437a', '#2f6bd8', '#fff7e8'];
const INK = '#24211e';
const azar = (a: number, b: number) => a + Math.random() * (b - a);
const elegir = <T>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

function contar(fx: Fx, de: number, a: number, duration = 0.7) {
  const o = { v: de };
  return gsap.to(o, { v: a, duration: de === a ? 0.01 : duration, ease: 'power2.out', onUpdate: () => fx.ponerNumero(Math.round(o.v)) });
}

function crear(fx: Fx, html: string, css: Partial<CSSStyleDeclaration> = {}) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  Object.assign(el.style, css);
  fx.capa.appendChild(el);
  return el;
}

function destello(fx: Fx, fuerza = 0.5) {
  return gsap.fromTo(fx.destello, { opacity: fuerza }, { opacity: 0, duration: 0.7, ease: 'power2.out' });
}

function rebote(fx: Fx, fuerza = 1.22) {
  return gsap
    .timeline()
    .fromTo(fx.numero, { scale: 1 }, { scale: fuerza, duration: 0.22, ease: 'back.out(3)' })
    .to(fx.numero, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
}

/** Rellena la línea de tiempo hasta `t` segundos y limpia los elementos creados. */
function cerrar(tl: gsap.core.Timeline, t: number, limpiar: HTMLElement[] = []) {
  tl.to({}, { duration: Math.max(0, t - tl.duration()) });
  tl.call(() => limpiar.forEach((el) => el.remove()));
  return tl;
}

/** Círculo que tapa toda la pantalla: se crea a tamaño real (escalar uno pequeño se ve borroso). */
function circulo(fx: Fx, color: string, top = '55%') {
  const d = Math.ceil(Math.hypot(innerWidth, innerHeight) * 1.15);
  return crear(fx, '<div></div>', { left: '50%', top, width: `${d}px`, height: `${d}px`, marginLeft: `${-d / 2}px`, marginTop: `${-d / 2}px`, borderRadius: '50%', background: color });
}

const corazon = (c: string) =>
  `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.3 8.3 2.3 4 6.3 4c2.2 0 3.6 1.2 4.4 2.4h2.6C14.1 5.2 15.5 4 17.7 4c4 0 6 4.3 4.3 7.7C19.5 16.4 12 21 12 21z" fill="${c}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

const globo = (c: string) =>
  `<svg viewBox="0 0 60 130"><path d="M30 78 C 26 92, 36 100, 30 112 S 26 124, 31 130" fill="none" stroke="#fff7e8" stroke-opacity=".7" stroke-width="2"/><path d="M26 80 L34 80 L30 74 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="30" cy="40" rx="26" ry="34" fill="${c}" stroke="${INK}" stroke-width="3"/><ellipse cx="20" cy="26" rx="6" ry="10" fill="#fff" fill-opacity=".45" transform="rotate(-20 20 26)"/></svg>`;

/* ------------------------------------------------------------------ */
/*  Las celebraciones                                                  */
/* ------------------------------------------------------------------ */

type Celebracion = (fx: Fx, de: number, a: number) => gsap.core.Timeline;

/** Dos cañones de confeti desde las esquinas de abajo. */
const canones: Celebracion = (fx, de, a) => {
  const tiro = (fuerza: number) => {
    fx.confeti({ particleCount: 130, angle: 60, spread: 58, startVelocity: 78 * fuerza, origin: { x: -0.02, y: 1.02 }, colors: COLORES, ticks: 260 });
    fx.confeti({ particleCount: 130, angle: 120, spread: 58, startVelocity: 78 * fuerza, origin: { x: 1.02, y: 1.02 }, colors: COLORES, ticks: 260 });
  };
  const tl = gsap.timeline();
  tl.call(() => tiro(1), [], 0);
  tl.add(contar(fx, de, a, 0.5), 0.05).add(rebote(fx), 0.05);
  tl.call(() => tiro(0.8), [], 0.5);
  return cerrar(tl, 3.4);
};

/** Fuegos artificiales sobre el número. */
const fuegos: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  for (let i = 0; i < 7; i++) {
    tl.call(
      () => {
        const c1 = elegir(COLORES);
        fx.confeti({
          particleCount: 90,
          spread: 360,
          startVelocity: azar(24, 36),
          gravity: 0.65,
          decay: 0.92,
          ticks: 200,
          scalar: 0.9,
          shapes: ['circle'],
          origin: { x: azar(0.12, 0.88), y: azar(0.12, 0.45) },
          colors: [c1, '#fff7e8', elegir(COLORES)],
        });
        destello(fx, 0.25);
      },
      [],
      i * 0.3,
    );
  }
  tl.add(contar(fx, de, a, 0.6), 0.1).add(rebote(fx, 1.15), 0.1);
  return cerrar(tl, 3.6);
};

/** Lluvia de confeti y el número cae desde arriba. */
const lluvia: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  let fin = 0;
  const caer = () => {
    if (performance.now() > fin) return gsap.ticker.remove(caer);
    fx.confeti({ particleCount: 3, angle: 270, spread: 25, startVelocity: 8, gravity: 0.9, drift: azar(-0.6, 0.6), ticks: 320, origin: { x: Math.random(), y: -0.05 }, colors: COLORES, scalar: 1.1 });
  };
  tl.call(() => {
    fin = performance.now() + 2300;
    gsap.ticker.add(caer);
    fx.ponerNumero(a);
  });
  tl.fromTo(fx.numero, { yPercent: -140, rotate: -10 }, { yPercent: 0, rotate: 0, duration: 1.1, ease: 'bounce.out' }, 0);
  return cerrar(tl, 3.6);
};

/** Un sello gigante «+1» que cae de golpe y hace temblar la pantalla. */
const sello: Celebracion = (fx, de, a) => {
  const n = Math.max(1, a - de);
  const el = crear(
    fx,
    `<div><span>+${n}</span></div>`,
    {
      left: '50%',
      top: '50%',
      width: '44vmin',
      height: '44vmin',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '50%',
      border: `0.9vmin solid ${INK}`,
      background: '#f5b50b',
      color: INK,
      boxShadow: `1.6vmin 1.6vmin 0 #f7363a`,
      fontFamily: 'var(--font-display)',
      fontSize: '22vmin',
      lineHeight: '1',
      paddingTop: '3vmin',
    },
  );
  gsap.set(el, { xPercent: -50, yPercent: -50 });
  const tl = gsap.timeline();
  tl.fromTo(el, { scale: 4, rotate: -50, opacity: 0 }, { scale: 1, rotate: -12, opacity: 1, duration: 0.38, ease: 'power4.in' });
  tl.call(() => {
    fx.confeti({ particleCount: 160, spread: 360, startVelocity: 48, origin: { x: 0.5, y: 0.5 }, colors: COLORES, ticks: 220 });
    destello(fx, 0.6);
    fx.ponerNumero(a);
  });
  tl.to(fx.escena, { keyframes: { x: [0, -22, 18, -12, 8, -4, 0], y: [0, 10, -8, 6, -3, 0, 0] }, duration: 0.45, ease: 'none' });
  tl.to(el, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, '<');
  tl.to(el, { x: '38vw', y: '-40vh', scale: 0.25, rotate: 30, opacity: 0, duration: 0.7, ease: 'power3.in' }, '+=0.75');
  tl.add(rebote(fx, 1.12), '<0.4');
  return cerrar(tl, 3.4, [el]);
};

/** Corazones que suben de abajo arriba. */
const corazones: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  const els: HTMLElement[] = [];
  for (let i = 0; i < 34; i++) {
    const size = azar(4, 10);
    const el = crear(fx, corazon(elegir(COLORES)), { left: `${azar(-2, 96)}vw`, top: '100vh', width: `${size}vmin`, height: `${size}vmin` });
    els.push(el);
    const d = azar(2.4, 3.8);
    const t = azar(0, 0.9);
    tl.fromTo(el, { y: 0, rotate: azar(-30, 30) }, { y: `-${azar(115, 135)}vh`, rotate: azar(-30, 30), duration: d, ease: 'power1.in' }, t);
    tl.to(el, { x: `${azar(-8, 8)}vw`, duration: d / 3, ease: 'sine.inOut', yoyo: true, repeat: 2 }, t);
  }
  tl.call(() => fx.ponerNumero(a), [], 0.15);
  tl.add(
    gsap
      .timeline()
      .to(fx.numero, { scale: 1.16, duration: 0.14, ease: 'power2.out' })
      .to(fx.numero, { scale: 1, duration: 0.2 })
      .to(fx.numero, { scale: 1.12, duration: 0.14, ease: 'power2.out' })
      .to(fx.numero, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }),
    0.15,
  );
  return cerrar(tl, 4.4, els);
};

/** Globos que se escapan hacia el techo. */
const globos: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  const els: HTMLElement[] = [];
  for (let i = 0; i < 16; i++) {
    const w = azar(7, 12);
    const el = crear(fx, globo(COLORES[i % 7]), { left: `${(i / 16) * 100 + azar(-3, 3)}vw`, top: '100vh', width: `${w}vmin`, height: `${w * 2.17}vmin` });
    els.push(el);
    const d = azar(3.2, 4.4);
    const t = azar(0, 0.7);
    tl.fromTo(el, { y: 0 }, { y: `-${azar(140, 170)}vh`, duration: d, ease: 'power1.inOut' }, t);
    tl.fromTo(el, { rotate: -8 }, { rotate: 8, duration: azar(0.6, 0.9), ease: 'sine.inOut', yoyo: true, repeat: 5 }, t);
  }
  tl.add(contar(fx, de, a, 0.5), 0.1);
  tl.fromTo(fx.numero, { y: 0 }, { y: '-6vh', duration: 0.3, ease: 'power2.out' }, 0.1).to(fx.numero, { y: 0, duration: 0.9, ease: 'bounce.out' });
  return cerrar(tl, 5, els);
};

/** Ondas de color que inundan la pantalla y revelan el número nuevo. */
const ondas: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  const els = ['#f87341', '#f5b50b', '#8cc63f', '#1fb3b0'].map((c) => circulo(fx, c));
  els.forEach((el, i) => tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.65, ease: 'power3.in' }, i * 0.13));
  tl.call(() => {
    fx.ponerNumero(a);
    fx.confeti({ particleCount: 140, spread: 360, startVelocity: 42, origin: { x: 0.5, y: 0.55 }, colors: [INK, '#fff7e8', '#f7363a', '#f5b50b'], ticks: 220 });
  });
  tl.to(els, { opacity: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out' });
  tl.fromTo(fx.numero, { scale: 0.2, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2.2)', immediateRender: false }, '<');
  return cerrar(tl, 3.4, els);
};

const FRASES = ['¡Gracias!', '¡Uno más!', '¡Olé!', '¡Qué grande!', '¡Bienvenida/o!', '¡Seguimos!', '¡Vamos!', '¡Toma ya!'];

/** Una palabra enorme que aparece letra a letra. */
const palabra: Celebracion = (fx, de, a) => {
  const frase = elegir(FRASES);
  const letras = Array.from(frase)
    .map((l, i) => `<span style="display:inline-block;color:${COLORES[i % 7]}">${l === ' ' ? '&nbsp;' : l}</span>`)
    .join('');
  const el = crear(fx, `<div>${letras}</div>`, {
    left: '0',
    right: '0',
    top: '50%',
    textAlign: 'center',
    fontFamily: 'var(--font-display)',
    fontSize: `min(24vh, ${Math.floor(170 / frase.length)}vw)`,
    lineHeight: '1',
    textTransform: 'uppercase',
    webkitTextStroke: `0.035em ${INK}`,
    paintOrder: 'stroke fill',
    textShadow: `0.06em 0.06em 0 ${INK}`,
  });
  gsap.set(el, { yPercent: -50 });
  const spans = Array.from(el.children);
  const tl = gsap.timeline();
  tl.to(fx.numero, { opacity: 0.15, scale: 0.85, duration: 0.25 }, 0);
  tl.fromTo(spans, { y: '60vh', scale: 0, rotate: () => azar(-60, 60) }, { y: 0, scale: 1, rotate: () => azar(-8, 8), duration: 0.55, stagger: 0.05, ease: 'back.out(2.2)' }, 0);
  tl.call(() => {
    fx.confeti({ particleCount: 70, angle: 35, spread: 50, startVelocity: 60, origin: { x: 0, y: 0.7 }, shapes: ['star'], colors: COLORES });
    fx.confeti({ particleCount: 70, angle: 145, spread: 50, startVelocity: 60, origin: { x: 1, y: 0.7 }, shapes: ['star'], colors: COLORES });
  });
  tl.to(spans, { y: '-70vh', rotate: () => azar(-90, 90), opacity: 0, duration: 0.5, stagger: 0.03, ease: 'power3.in' }, '+=0.75');
  tl.call(() => fx.ponerNumero(a));
  tl.to(fx.numero, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)' }, '-=0.25');
  return cerrar(tl, 3.6, [el]);
};

/** Explosión de estrellas y el número gira sobre sí mismo. */
const estrellas: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  tl.to(fx.numero, { rotationY: 180, duration: 0.3, ease: 'power2.in' });
  tl.call(() => {
    fx.ponerNumero(a);
    fx.confeti({ particleCount: 170, spread: 360, startVelocity: 58, gravity: 0.8, scalar: 1.5, shapes: ['star'], origin: { x: 0.5, y: 0.55 }, colors: ['#f5b50b', '#fff7e8', '#f87341', '#ffae34'], ticks: 240 });
    destello(fx, 0.55);
  });
  tl.fromTo(fx.numero, { rotationY: -180 }, { rotationY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)', immediateRender: false });
  tl.call(() => fx.confeti({ particleCount: 90, spread: 360, startVelocity: 35, scalar: 1.1, shapes: ['star'], origin: { x: 0.5, y: 0.55 }, colors: ['#f5b50b', '#fff7e8'] }), [], 0.9);
  return cerrar(tl, 3.4);
};

/** Tragaperras: el número da vueltas hasta parar en el nuevo. */
const ruleta: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  const top = Math.max(9, a * 2);
  for (let i = 0; i < 14; i++) {
    tl.call(() => fx.ponerNumero(Math.floor(Math.random() * top)), [], i * 0.06);
    tl.fromTo(fx.numero, { yPercent: -18 }, { yPercent: 0, duration: 0.06, ease: 'none', immediateRender: false }, i * 0.06);
  }
  tl.call(() => {
    fx.ponerNumero(a);
    fx.confeti({ particleCount: 110, angle: 90, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 1 }, colors: COLORES, ticks: 240 });
  });
  tl.fromTo(fx.numero, { yPercent: -25, scale: 1.25 }, { yPercent: 0, scale: 1, duration: 0.9, ease: 'bounce.out', immediateRender: false });
  return cerrar(tl, 3.2);
};

const VARIANTES: Celebracion[] = [canones, fuegos, lluvia, sello, corazones, globos, ondas, palabra, estrellas, ruleta];

/* ------------------------------------------------------------------ */
/*  Decenas: la gorda                                                  */
/* ------------------------------------------------------------------ */

const megaHito: Celebracion = (fx, de, a) => {
  const tl = gsap.timeline();
  const ondasEls = ['#f7363a', '#f5b50b', '#8cc63f', '#1fb3b0', '#8e5cf0'].map((c) => circulo(fx, c, '50%'));
  ondasEls.forEach((el, i) => tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'power3.in' }, i * 0.11));

  const cinta = crear(
    fx,
    `<div><div style="font-size:min(30vh,22vw);line-height:.9">${a}</div><div style="font-size:min(10vh,8vw)">socios y socias</div></div>`,
    {
      left: '-5vw',
      right: '-5vw',
      top: '50%',
      padding: '3vh 0 2vh',
      textAlign: 'center',
      background: '#f5b50b',
      borderTop: `1.2vmin solid ${INK}`,
      borderBottom: `1.2vmin solid ${INK}`,
      color: INK,
      fontFamily: 'var(--font-display)',
      textTransform: 'uppercase',
    },
  );
  gsap.set(cinta, { yPercent: -50, rotate: -4 });
  tl.fromTo(cinta, { xPercent: -110 }, { xPercent: 0, duration: 0.55, ease: 'back.out(1.4)' }, 0.75);
  tl.call(() => fx.ponerNumero(a), [], 0.8);

  for (let i = 0; i < 9; i++) {
    tl.call(
      () =>
        fx.confeti({
          particleCount: 100,
          spread: 360,
          startVelocity: azar(28, 40),
          gravity: 0.7,
          ticks: 220,
          origin: { x: azar(0.1, 0.9), y: azar(0.1, 0.4) },
          colors: [elegir(COLORES), '#fff7e8', INK],
        }),
      [],
      1.1 + i * 0.28,
    );
  }
  tl.call(
    () => {
      fx.confeti({ particleCount: 200, angle: 60, spread: 70, startVelocity: 85, origin: { x: -0.02, y: 1 }, colors: COLORES, ticks: 300 });
      fx.confeti({ particleCount: 200, angle: 120, spread: 70, startVelocity: 85, origin: { x: 1.02, y: 1 }, colors: COLORES, ticks: 300 });
    },
    [],
    1.4,
  );
  tl.to(cinta, { scale: 1.06, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.4);
  tl.to(cinta, { xPercent: 110, duration: 0.5, ease: 'power3.in' }, 4.2);
  tl.to(ondasEls, { opacity: 0, duration: 0.6, stagger: 0.05 }, 4.3);
  tl.fromTo(fx.numero, { scale: 0.3 }, { scale: 1, duration: 1, ease: 'elastic.out(1, 0.4)', immediateRender: false }, 4.5);
  return cerrar(tl, 6, [cinta, ...ondasEls]);
};

/* ------------------------------------------------------------------ */

let bolsa: Celebracion[] = [];
let ultima: Celebracion | null = null;

/** Siguiente celebración de una bolsa barajada: todas salen antes de repetir. */
function siguiente() {
  if (!bolsa.length) {
    bolsa = VARIANTES.slice().sort(() => Math.random() - 0.5);
    if (bolsa[bolsa.length - 1] === ultima) bolsa.unshift(bolsa.pop()!);
  }
  ultima = bolsa.pop()!;
  return ultima;
}

/** ¿Se ha cruzado una decena (10, 20, 30…) al pasar de `de` a `a`? */
export const esHito = (de: number, a: number) => a > de && Math.floor(a / 10) > Math.floor(de / 10);

export function celebrar(fx: Fx, de: number, a: number) {
  const tl = (esHito(de, a) ? megaHito : siguiente())(fx, de, a);
  return new Promise<void>((ok) => tl.eventCallback('onComplete', () => ok()));
}
