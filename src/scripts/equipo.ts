/*
 * Panel del equipo: apuntar socios/as muy rápido, ver el total y ajustar el contador.
 * Varios iPads a la vez: cada uno pregunta cada 3 s. Lo que se apunta sin conexión se
 * guarda en el navegador y se envía en cuanto vuelve la red.
 */
import { ESTADOS, ESTADO_DEFECTO, type Config, type EstadoId, type Socio } from '../data/socios';
import { Campanero } from './sonidos';

const $ = <T extends HTMLElement = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));

type Datos = { nombre: string; telefono: string; estado: EstadoId; nota: string };
type Pendiente = Datos & { tmp: number; creado: string };
type Fila = (Socio | (Pendiente & { id: number; origen: 'equipo' })) & { pendiente?: boolean };

const CLAVE_PENDIENTES = 'dwf_pendientes';

let socios: Socio[] = [];
let config: Config = { ajuste: 0, sonido: 'carillon', ping: 0, qr: false };
let pendientes: Pendiente[] = leerPendientes();
let version = 0; // sube con cada cambio local: descarta lecturas que ya llegan viejas
let cargado = false;
let filtro: 'todos' | 'contactar' | 'qr' = 'todos';
let busqueda = '';
const recien = new Set<number>();
const reales = new Map<number, number>(); // id temporal → id real

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const normal = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const hora = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
const estadoDe = (id: string) => ESTADOS.find((e) => e.id === id) ?? ESTADOS[0];

function fmtTel(t: string) {
  const d = t.replace(/\D/g, '');
  const m = d.match(/^(?:0034|34)?([6-9]\d{8})$/);
  if (!m) return t;
  const n = m[1];
  return `${d.length > 9 ? '+34 ' : ''}${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

function leerPendientes(): Pendiente[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PENDIENTES) || '[]');
  } catch {
    return [];
  }
}
function guardarPendientes() {
  try {
    localStorage.setItem(CLAVE_PENDIENTES, JSON.stringify(pendientes));
  } catch {
    /* modo privado: se quedan en memoria */
  }
}

async function api<T = Record<string, unknown>>(method: string, url: string, body?: unknown): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      method,
      cache: 'no-store',
      signal: ctrl.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`);
    return data as T;
  } finally {
    clearTimeout(t);
  }
}

const conexion = $('[data-conexion]');
function marcarConexion(ok: boolean) {
  conexion.dataset.mal = String(!ok);
  conexion.title = ok ? 'Conectado' : 'Sin conexión: lo que apuntes se enviará al volver la red';
}

/* ------------------------------------------------------------------ */
/*  Aviso con «Deshacer»                                               */
/* ------------------------------------------------------------------ */

const tostada = $('[data-tostada]');
const tostadaTexto = $('[data-tostada-texto]');
const btnDeshacer = $<HTMLButtonElement>('[data-deshacer]');
let alDeshacer: (() => void) | null = null;
let tostadaT = 0;

function avisar(texto: string, deshacer?: () => void) {
  tostadaTexto.textContent = texto;
  alDeshacer = deshacer ?? null;
  btnDeshacer.hidden = !deshacer;
  tostada.hidden = false;
  tostada.style.animation = 'none';
  void tostada.offsetWidth;
  tostada.style.animation = '';
  clearTimeout(tostadaT);
  tostadaT = window.setTimeout(() => (tostada.hidden = true), deshacer ? 6000 : 3000);
}
btnDeshacer.addEventListener('click', () => {
  tostada.hidden = true;
  alDeshacer?.();
  alDeshacer = null;
});

/* ------------------------------------------------------------------ */
/*  Pintar                                                             */
/* ------------------------------------------------------------------ */

const elTotal = $('[data-total]');
const elDesglose = $('[data-desglose]');
const elUltimo = $('[data-ultimo]');
const lista = $('[data-lista]');
const vacio = $('[data-vacio]');
const cuenta = $('[data-cuenta]');
let totalPintado: number | null = null;

function filas(): Fila[] {
  const p: Fila[] = pendientes.map((x) => ({ ...x, id: x.tmp, origen: 'equipo' as const, pendiente: true })).reverse();
  return [...p, ...socios];
}

function pintarContador() {
  const todas = filas();
  const existentes = todas.filter((s) => s.estado === 'ya_socio').length;
  const total = Math.max(0, todas.length + config.ajuste);
  elTotal.textContent = cargado || pendientes.length ? String(total) : '–';
  const partes = [`${todas.length - existentes} nuevos`, `${existentes} ya eran socios`];
  if (config.ajuste) partes.push(`ajuste ${config.ajuste > 0 ? '+' : ''}${config.ajuste}`);
  elDesglose.textContent = partes.join(' · ');
  const ult = todas.find((s) => s.nombre);
  elUltimo.textContent = ult ? `Último: ${ult.nombre.split(' ')[0]} · ${hora.format(new Date(ult.creado))}` : '';
  if (totalPintado !== null && total > totalPintado) {
    elTotal.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18) rotate(-3deg)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  }
  totalPintado = total;
}

function pintarLista() {
  const q = normal(busqueda.trim());
  const todas = filas();
  const visibles = todas.filter((s) => {
    if (filtro === 'contactar' && s.estado !== 'contactar') return false;
    if (filtro === 'qr' && s.origen !== 'qr') return false;
    if (q && !normal(`${s.nombre} ${s.telefono} ${s.nota}`).includes(q) && !s.telefono.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§')) return false;
    return true;
  });
  cuenta.textContent = `(${todas.length})`;
  vacio.hidden = todas.length > 0;
  vacio.classList.toggle('hidden', todas.length > 0);

  lista.innerHTML = visibles
    .map((s) => {
      const e = estadoDe(s.estado);
      const nombre = s.nombre ? esc(s.nombre) : `<span class="text-ink/45 italic">${s.estado === 'ya_socio' ? 'Socio/a existente' : 'Sin nombre'}</span>`;
      const sub = [s.telefono ? `<span class="whitespace-nowrap">☎ ${esc(fmtTel(s.telefono))}</span>` : '', s.nota ? `<span class="truncate">${esc(s.nota)}</span>` : '']
        .filter(Boolean)
        .join('<span class="text-ink/25">·</span>');
      return `<li${recien.has(s.id) ? ' class="fila-nuevo"' : ''}>
        <button type="button" class="fila" data-id="${s.id}" data-pendiente="${!!s.pendiente}">
          <span class="size-4 shrink-0 rounded-full border-2 border-ink" style="background:${e.color}"></span>
          <span class="min-w-0">
            <span class="block truncate text-lg leading-tight font-bold">${nombre}</span>
            ${sub ? `<span class="mt-0.5 flex min-w-0 items-center gap-1.5 text-[0.95rem] font-medium text-ink/65">${sub}</span>` : ''}
          </span>
          <span class="flex flex-col items-end gap-1">
            <span class="whitespace-nowrap rounded-full border-2 border-ink px-2.5 pt-1 pb-0.5 font-display text-[0.78rem] uppercase" style="background:${e.color}">${esc(e.short)}</span>
            <span class="whitespace-nowrap text-sm font-semibold text-ink/50">${s.origen === 'qr' ? '<span class="rounded bg-ink px-1.5 py-px font-display text-[0.7rem] text-gold">QR</span> ' : ''}${s.pendiente ? 'enviando…' : hora.format(new Date(s.creado))}</span>
          </span>
        </button>
      </li>`;
    })
    .join('');
  recien.clear();
}

function pintarAjustes() {
  const radio = $<HTMLInputElement>(`[data-sonidos] input[value="${config.sonido}"]`);
  if (radio && !radio.checked) radio.checked = true;
  const qr = $<HTMLInputElement>('[data-qr-contador]');
  if (qr.checked !== config.qr) qr.checked = config.qr;
}

function pintar() {
  pintarContador();
  pintarLista();
  pintarAjustes();
}

/* ------------------------------------------------------------------ */
/*  Datos                                                              */
/* ------------------------------------------------------------------ */

type Panel = { socios: Socio[]; config: Config };
let firma = '';

async function cargar() {
  const v = version;
  try {
    const d = await api<Panel>('GET', '/api/socios');
    marcarConexion(true);
    if (v !== version) return;
    const nueva = JSON.stringify(d);
    cargado = true;
    if (nueva === firma) return;
    firma = nueva;
    socios = d.socios;
    config = d.config;
    pintar();
  } catch {
    marcarConexion(false);
  }
}

let enviando = false;
async function enviarPendientes() {
  if (enviando || !pendientes.length) return;
  enviando = true;
  try {
    while (pendientes.length) {
      const p = pendientes[0];
      const { socio } = await api<{ socio: Socio }>('POST', '/api/socios', { nombre: p.nombre, telefono: p.telefono, estado: p.estado, nota: p.nota });
      version++;
      reales.set(p.tmp, socio.id);
      pendientes = pendientes.filter((x) => x.tmp !== p.tmp);
      guardarPendientes();
      if (!socios.some((s) => s.id === socio.id)) socios.unshift(socio);
      pintar();
    }
    marcarConexion(true);
  } catch {
    marcarConexion(false);
  } finally {
    enviando = false;
  }
}

let temporizador = 0;
function bucle() {
  clearTimeout(temporizador);
  Promise.all([cargar(), enviarPendientes()]).finally(() => (temporizador = window.setTimeout(bucle, 3000)));
}

async function borrar(id: number) {
  const real = id < 0 ? reales.get(id) : id;
  version++;
  if (id < 0 && real === undefined) {
    pendientes = pendientes.filter((p) => p.tmp !== id);
    guardarPendientes();
    pintar();
    return true;
  }
  const antes = socios;
  socios = socios.filter((s) => s.id !== real);
  pintar();
  try {
    await api('DELETE', `/api/socios/${real}`);
    return true;
  } catch (err) {
    socios = antes;
    pintar();
    avisar(`No se ha podido borrar: ${(err as Error).message}`);
    return false;
  }
}

function apuntar(d: Datos, texto: string) {
  const p: Pendiente = { ...d, tmp: -Date.now() - Math.floor(Math.random() * 1000), creado: new Date().toISOString() };
  pendientes.push(p);
  guardarPendientes();
  version++;
  recien.add(p.tmp);
  pintar();
  enviarPendientes();
  avisar(texto, () => borrar(p.tmp).then((ok) => ok && avisar('Deshecho')));
}

async function cambiarConfig(cambios: Partial<Record<'total' | 'sonido' | 'ping' | 'qr', unknown>>) {
  version++;
  const { config: c } = await api<{ config: Config }>('POST', '/api/config', cambios);
  config = c;
  pintar();
}

/* ------------------------------------------------------------------ */
/*  Formulario rápido                                                  */
/* ------------------------------------------------------------------ */

const form = $<HTMLFormElement>('[data-form]');
const inNombre = $<HTMLInputElement>('[data-nombre]');
const inTel = $<HTMLInputElement>('[data-telefono]');
const inNota = $<HTMLInputElement>('[data-nota]');

inNombre.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  inTel.focus();
});
inTel.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  inNota.focus();
});
// Con un móvil español completo (9 cifras) salta solo a la nota
inTel.addEventListener('input', () => {
  const d = inTel.value.replace(/\D/g, '').replace(/^(0034|34)(?=\d{9}$)/, '');
  if (/^[6-9]\d{8}$/.test(d)) inNota.focus();
});
inNombre.addEventListener('input', () => (inNombre.closest<HTMLElement>('.campo')!.dataset.error = 'false'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const d: Datos = {
    nombre: String(fd.get('nombre') || '').trim(),
    telefono: String(fd.get('telefono') || '').trim(),
    estado: (fd.get('estado') as EstadoId) || ESTADO_DEFECTO,
    nota: String(fd.get('nota') || '').trim(),
  };
  if (!d.nombre && d.estado !== 'ya_socio') {
    const campo = inNombre.closest<HTMLElement>('.campo')!;
    campo.dataset.error = 'false';
    void campo.offsetWidth;
    campo.dataset.error = 'true';
    inNombre.focus();
    return;
  }
  // Primero limpiar y enfocar (así el teclado del iPad no se cierra), luego enviar
  form.reset();
  inNombre.focus();
  apuntar(d, `✓ ${d.nombre || 'Socio/a existente'} apuntado/a`);
});

$('[data-ya-socio]').addEventListener('click', () => {
  apuntar({ nombre: '', telefono: '', estado: 'ya_socio', nota: '' }, '✓ +1 socio/a que ya lo era');
});

/* ------------------------------------------------------------------ */
/*  Lista: buscar, filtrar, editar                                     */
/* ------------------------------------------------------------------ */

$<HTMLInputElement>('[data-buscar]').addEventListener('input', (e) => {
  busqueda = (e.target as HTMLInputElement).value;
  pintarLista();
});
$$<HTMLButtonElement>('[data-filtro]').forEach((b) =>
  b.addEventListener('click', () => {
    filtro = b.dataset.filtro as typeof filtro;
    $$('[data-filtro]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    pintarLista();
  }),
);

const hojas = Object.fromEntries($$<HTMLDialogElement>('dialog[data-hoja]').map((d) => [d.dataset.hoja!, d]));
function abrir(nombre: string) {
  Object.values(hojas).forEach((h) => h.open && h.close());
  hojas[nombre]?.showModal();
}
$$<HTMLElement>('[data-abrir]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.abrir!)));
Object.values(hojas).forEach((h) => {
  h.addEventListener('click', (e) => {
    if (e.target === h || (e.target as HTMLElement).closest('[data-cerrar]')) h.close();
  });
});

const formEditar = $<HTMLFormElement>('[data-form-editar]');
const btnBorrar = $<HTMLButtonElement>('[data-borrar]');
let editando: Fila | null = null;
let confirmarT = 0;

lista.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!b) return;
  const id = Number(b.dataset.id);
  const s = filas().find((x) => x.id === id);
  if (!s) return;
  editando = s;
  const f = formEditar.elements as unknown as Record<string, HTMLInputElement>;
  f.nombre.value = s.nombre;
  f.telefono.value = s.telefono;
  f.nota.value = s.nota;
  $$<HTMLInputElement>('input[name="estado"]', formEditar).forEach((r) => (r.checked = r.value === s.estado));
  $('[data-edit-meta]').textContent = `${s.origen === 'qr' ? 'Desde el QR' : 'Apuntado por el equipo'} · ${hora.format(new Date(s.creado))}`;
  btnBorrar.textContent = 'Borrar';
  delete btnBorrar.dataset.confirmar;
  abrir('editar');
});

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editando) return;
  const fd = new FormData(formEditar);
  const d: Datos = {
    nombre: String(fd.get('nombre') || ''),
    telefono: String(fd.get('telefono') || ''),
    estado: (fd.get('estado') as EstadoId) || editando.estado,
    nota: String(fd.get('nota') || ''),
  };
  const id = editando.id;
  hojas.editar.close();
  version++;
  if (id < 0 && !reales.has(id)) {
    pendientes = pendientes.map((p) => (p.tmp === id ? { ...p, ...d } : p));
    guardarPendientes();
    pintar();
    return;
  }
  const real = id < 0 ? reales.get(id)! : id;
  socios = socios.map((s) => (s.id === real ? { ...s, ...d } : s));
  pintar();
  try {
    await api('PATCH', `/api/socios/${real}`, d);
    avisar('✓ Guardado');
  } catch (err) {
    avisar(`No se ha podido guardar: ${(err as Error).message}`);
    cargar();
  }
});

btnBorrar.addEventListener('click', async () => {
  if (!editando) return;
  if (!btnBorrar.dataset.confirmar) {
    btnBorrar.dataset.confirmar = '1';
    btnBorrar.textContent = '¿Seguro? Toca otra vez';
    clearTimeout(confirmarT);
    confirmarT = window.setTimeout(() => {
      btnBorrar.textContent = 'Borrar';
      delete btnBorrar.dataset.confirmar;
    }, 3500);
    return;
  }
  const s = editando;
  hojas.editar.close();
  if (await borrar(s.id)) avisar(`Borrado: ${s.nombre || 'socio/a existente'}`);
});

/* ------------------------------------------------------------------ */
/*  Modificar número                                                   */
/* ------------------------------------------------------------------ */

const formNumero = $<HTMLFormElement>('[data-form-numero]');
const inNum = $<HTMLInputElement>('[data-num]');
const numInfo = $('[data-num-info]');
const totalActual = () => Math.max(0, filas().length + config.ajuste);

$('[data-abrir="numero"]').addEventListener('click', () => {
  inNum.value = String(totalActual());
  numInfo.textContent = `Ahora: ${totalActual()} (${filas().length} apuntados${config.ajuste ? `, ajuste ${config.ajuste > 0 ? '+' : ''}${config.ajuste}` : ''})`;
});
$$<HTMLButtonElement>('[data-num-paso]').forEach((b) =>
  b.addEventListener('click', () => {
    inNum.value = String(Math.max(0, (Number(inNum.value) || 0) + Number(b.dataset.numPaso)));
  }),
);
inNum.addEventListener('focus', () => inNum.select());
formNumero.addEventListener('submit', async (e) => {
  e.preventDefault();
  const n = Number(inNum.value.replace(/\D/g, ''));
  if (!Number.isFinite(n)) return;
  hojas.numero.close();
  try {
    await cambiarConfig({ total: n });
    avisar(`✓ El contador marca ahora ${totalActual()}`);
  } catch (err) {
    avisar(`No se ha podido cambiar: ${(err as Error).message}`);
  }
});

/* ------------------------------------------------------------------ */
/*  Sonido y pantallas                                                 */
/* ------------------------------------------------------------------ */

const campanero = new Campanero();

$$<HTMLButtonElement>('[data-escuchar]').forEach((b) =>
  b.addEventListener('click', async () => {
    await campanero.desbloquear();
    campanero.tocar(b.dataset.escuchar!);
  }),
);
$$<HTMLInputElement>('[data-sonidos] input').forEach((r) =>
  r.addEventListener('change', async () => {
    await campanero.desbloquear();
    campanero.tocar(r.value);
    try {
      await cambiarConfig({ sonido: r.value });
      avisar('✓ Sonido cambiado en los contadores');
    } catch {
      avisar('No se ha podido cambiar el sonido');
    }
  }),
);
$('[data-probar]').addEventListener('click', async () => {
  try {
    await cambiarConfig({ ping: true });
    avisar('🎉 Celebración enviada a los contadores');
  } catch {
    avisar('Sin conexión con el contador');
  }
});
$<HTMLInputElement>('[data-qr-contador]').addEventListener('change', async (e) => {
  const qr = (e.target as HTMLInputElement).checked;
  try {
    await cambiarConfig({ qr });
  } catch {
    avisar('No se ha podido cambiar');
  }
});

/* ------------------------------------------------------------------ */

document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && bucle());
window.addEventListener('online', bucle);
pintar();
bucle();
