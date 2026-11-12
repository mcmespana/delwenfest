/*
 * Campanas sintetizadas con Web Audio: no hay archivos que descargar y suenan igual
 * en el iPad del contador que en el del equipo. Cada sonido se programa sobre un
 * BaseAudioContext, así también se puede renderizar sin conexión para probarlo.
 */
import type { SonidoId } from '../data/socios';

type Ctx = BaseAudioContext;
type Parcial = [ratio: number, amp: number, dur: number];

/* ------------------------------------------------------------------ */
/*  Piezas                                                             */
/* ------------------------------------------------------------------ */

/** Reverberación de sala: ruido estéreo que se apaga poco a poco. */
function impulso(ctx: Ctx, seg = 2.8, caida = 3.4) {
  const len = Math.floor(ctx.sampleRate * seg);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let prev = 0;
    for (let i = 0; i < len; i++) {
      // Paso bajo muy suave para que la cola no sea chillona
      prev = prev * 0.55 + (Math.random() * 2 - 1) * 0.45;
      d[i] = prev * Math.pow(1 - i / len, caida);
    }
  }
  return buf;
}

/** Cadena de salida: entrada → (seco + reverb) → compresor → volumen general. */
export function crearSalida(ctx: Ctx, destino: AudioNode = ctx.destination) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 5;
  comp.attack.value = 0.002;
  comp.release.value = 0.3;
  const volumen = ctx.createGain();
  volumen.gain.value = 0.95;
  comp.connect(volumen).connect(destino);

  const rev = ctx.createConvolver();
  rev.buffer = impulso(ctx);
  const humedo = ctx.createGain();
  humedo.gain.value = 0.32;
  rev.connect(humedo).connect(comp);

  const entrada = ctx.createGain();
  entrada.connect(comp);
  entrada.connect(rev);
  return { entrada, volumen };
}

function panear(ctx: Ctx, destino: AudioNode, pan: number) {
  if (!pan || !ctx.createStereoPanner) return destino;
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  p.connect(destino);
  return p;
}

/** Un seno con ataque instantáneo y caída exponencial. */
function seno(ctx: Ctx, destino: AudioNode, t: number, f: number, amp: number, dur: number, detune = 0) {
  const o = ctx.createOscillator();
  o.frequency.value = f;
  o.detune.value = detune;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(destino);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Campana por síntesis aditiva: cada parcial con su ratio, volumen y duración. */
function aditiva(ctx: Ctx, destino: AudioNode, t: number, f: number, parciales: Parcial[], amp: number, dur: number, batido = 0) {
  for (const [r, a, d] of parciales) {
    seno(ctx, destino, t, f * r, amp * a, dur * d);
    // Segundo oscilador casi igual: el «batido» que hace viva a una campana real
    if (batido) seno(ctx, destino, t, f * r + batido * (0.5 + Math.random()), amp * a * 0.6, dur * d);
  }
}

/** Golpe metálico por FM: el brillo del ataque que luego se apaga. */
function fm(ctx: Ctx, destino: AudioNode, t: number, f: number, amp: number, dur: number, ratio = 3.5, indice = 1.8) {
  const car = ctx.createOscillator();
  car.frequency.value = f;
  const mod = ctx.createOscillator();
  mod.frequency.value = f * ratio;
  const mg = ctx.createGain();
  mg.gain.setValueAtTime(f * indice, t);
  mg.gain.exponentialRampToValueAtTime(f * indice * 0.02, t + dur * 0.7);
  mod.connect(mg).connect(car.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  car.connect(g).connect(destino);
  car.start(t);
  mod.start(t);
  car.stop(t + dur + 0.05);
  mod.stop(t + dur + 0.05);
}

/** Chasquido del badajo: ruido filtrado muy corto. */
function golpe(ctx: Ctx, destino: AudioNode, t: number, f: number, amp: number) {
  const len = Math.floor(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = f;
  bp.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.value = amp;
  src.connect(bp).connect(g).connect(destino);
  src.start(t);
}

// Parciales de cada tipo de campana
const CAMPANARIO: Parcial[] = [
  [0.5, 0.55, 1],
  [1, 0.7, 0.8],
  [1.19, 0.5, 0.62],
  [1.5, 0.22, 0.45],
  [2, 0.6, 0.5],
  [2.51, 0.22, 0.34],
  [2.66, 0.16, 0.3],
  [3.01, 0.14, 0.24],
  [4.07, 0.1, 0.18],
  [5.2, 0.06, 0.14],
];
const TUBULAR: Parcial[] = [
  [1, 1, 1],
  [2.01, 0.42, 0.55],
  [3, 0.2, 0.38],
  [4.16, 0.12, 0.28],
  [5.43, 0.07, 0.2],
];
const GLOCKEN: Parcial[] = [
  [1, 1, 1],
  [2.76, 0.28, 0.32],
  [5.4, 0.12, 0.16],
];

const nota = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** Campanita afinada: cuerpo tubular + brillo FM en el ataque. */
function campanita(ctx: Ctx, destino: AudioNode, t: number, f: number, amp: number, dur: number, pan = 0) {
  const d = panear(ctx, destino, pan);
  aditiva(ctx, d, t, f, TUBULAR, amp, dur, 0.8);
  fm(ctx, d, t, f, amp * 0.35, dur * 0.35, 3.5, 2.2);
}

/** Metal de banda: dos sierras desafinadas con filtro que se abre. */
function metal(ctx: Ctx, destino: AudioNode, t: number, f: number, amp: number, dur: number) {
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.Q.value = 2;
  filtro.frequency.setValueAtTime(350, t);
  filtro.frequency.exponentialRampToValueAtTime(3200, t + 0.06);
  filtro.frequency.exponentialRampToValueAtTime(1500, t + Math.min(dur, 0.5));
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.025);
  g.gain.setValueAtTime(amp * 0.85, t + Math.max(0.03, dur - 0.12));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
  filtro.connect(g).connect(destino);
  for (const det of [-7, 6]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.detune.value = det;
    o.connect(filtro);
    o.start(t);
    o.stop(t + dur + 0.2);
  }
}

/* ------------------------------------------------------------------ */
/*  Los sonidos                                                        */
/* ------------------------------------------------------------------ */

const PROGRAMAS: Record<SonidoId, (ctx: Ctx, out: AudioNode, t: number) => number> = {
  carillon(ctx, out, t) {
    [79, 84, 88, 91].forEach((m, i) => campanita(ctx, out, t + i * 0.13, nota(m), 0.26, 2.4, -0.45 + i * 0.3));
    campanita(ctx, out, t + 0.52, nota(96), 0.16, 3, 0.2);
    aditiva(ctx, out, t + 0.52, nota(60), TUBULAR, 0.13, 3.2, 0.5);
    return 3.6;
  },
  campana(ctx, out, t) {
    const f = nota(64);
    golpe(ctx, out, t, f * 3, 0.5);
    aditiva(ctx, out, t, f, CAMPANARIO, 0.24, 5.5, 0.7);
    fm(ctx, out, t, f * 2, 0.08, 1.2, 1.41, 2.5);
    return 5.6;
  },
  campanillas(ctx, out, t) {
    const escala = [84, 86, 88, 91, 93, 96, 98, 100, 103];
    escala.forEach((m, i) =>
      aditiva(ctx, panear(ctx, out, Math.sin(i * 1.7) * 0.7), t + i * 0.055 + Math.random() * 0.012, nota(m), GLOCKEN, 0.2, 1.5),
    );
    [96, 100, 103].forEach((m, i) => aditiva(ctx, panear(ctx, out, -0.4 + i * 0.4), t + 0.58, nota(m), GLOCKEN, 0.16, 2.4));
    return 3.1;
  },
  dingdong(ctx, out, t) {
    campanita(ctx, out, t, nota(76), 0.34, 2.6, -0.15);
    campanita(ctx, out, t + 0.48, nota(72), 0.34, 3.2, 0.15);
    aditiva(ctx, out, t + 0.48, nota(60), TUBULAR, 0.08, 3, 0.4);
    return 3.8;
  },
  barco(ctx, out, t) {
    const f = nota(86);
    [0, 0.2, 0.78, 0.98].forEach((dt, i) => {
      const amp = i % 2 ? 0.2 : 0.26;
      golpe(ctx, out, t + dt, f * 2, 0.25);
      fm(ctx, out, t + dt, f, amp, 1.9, 1.41, 2.6);
      aditiva(ctx, out, t + dt, f, CAMPANARIO.slice(1, 6), amp * 0.5, 2.2, 1.2);
    });
    return 3.3;
  },
  fanfarria(ctx, out, t) {
    [67, 72, 76].forEach((m, i) => metal(ctx, out, t + i * 0.14, nota(m), 0.13, 0.11));
    [72, 76, 79].forEach((m) => metal(ctx, out, t + 0.44, nota(m), 0.1, 1));
    metal(ctx, out, t + 0.44, nota(60), 0.08, 1);
    campanita(ctx, out, t + 0.44, nota(96), 0.18, 2.6, 0.25);
    campanita(ctx, out, t + 0.58, nota(91), 0.14, 2.4, -0.25);
    return 3.4;
  },
};

/** Remate para los números redondos: glissando de campanillas por encima. */
function hito(ctx: Ctx, out: AudioNode, t: number) {
  for (let i = 0; i < 14; i++) {
    aditiva(ctx, panear(ctx, out, -0.8 + (i / 13) * 1.6), t + i * 0.045, nota(84 + [0, 2, 4, 7, 9][i % 5] + 12 * Math.floor(i / 5)), GLOCKEN, 0.15, 1.6);
  }
  [72, 76, 79, 84].forEach((m, i) => campanita(ctx, out, t + 0.7 + i * 0.02, nota(m), 0.16, 3.4, -0.3 + i * 0.2));
  return 4.2;
}

/** Programa un sonido en el contexto dado y devuelve cuánto dura (s). */
export function programar(ctx: Ctx, out: AudioNode, id: string, t: number, esHito = false) {
  const fn = PROGRAMAS[id as SonidoId] ?? PROGRAMAS.carillon;
  const dur = fn(ctx, out, t);
  return esHito ? Math.max(dur, 0.9 + hito(ctx, out, t + 0.9)) : dur;
}

/* ------------------------------------------------------------------ */
/*  Reproductor para la página                                         */
/* ------------------------------------------------------------------ */

type ConSesion = Navigator & { audioSession?: { type: string } };

export class Campanero {
  private ctx: AudioContext | null = null;
  private entrada: AudioNode | null = null;

  /** Hay que llamarlo dentro de un toque: iOS no deja sonar nada antes. */
  async desbloquear() {
    try {
      // Que suene aunque el iPad esté en silencio
      const nav = navigator as ConSesion;
      if (nav.audioSession) nav.audioSession.type = 'playback';
      if (!this.ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC({ latencyHint: 'interactive' });
        this.entrada = crearSalida(this.ctx).entrada;
      }
      if (this.ctx.state !== 'running') await this.ctx.resume();
      // Un sonido vacío termina de abrir el audio en Safari
      const src = this.ctx.createBufferSource();
      src.buffer = this.ctx.createBuffer(1, 1, 22050);
      src.connect(this.ctx.destination);
      src.start();
    } catch {
      /* sin audio: la animación sigue funcionando */
    }
    return this.activo;
  }

  get activo() {
    return this.ctx?.state === 'running';
  }

  /** Reintenta reanudar (p. ej. tras bloquear y desbloquear la pantalla). */
  async reanudar() {
    if (this.ctx && this.ctx.state !== 'running') await this.ctx.resume().catch(() => {});
    return this.activo;
  }

  tocar(id: string, esHito = false) {
    if (!this.ctx || !this.entrada || !this.activo) return 0;
    return programar(this.ctx, this.entrada, id, this.ctx.currentTime + 0.03, esHito);
  }
}
