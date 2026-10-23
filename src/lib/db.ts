/*
 * Base de datos de socios (Neon Postgres, conectado al proyecto de Vercel con la
 * variable DATABASE_URL). Las tablas se crean solas la primera vez que hacen falta.
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { DATABASE_URL } from 'astro:env/server';
import { ESTADO_DEFECTO, ESTADO_IDS, SONIDOS, type Config, type EstadoId, type Origen, type Socio } from '../data/socios';

let client: NeonQueryFunction<false, false> | null = null;

function sql() {
  if (client) return client;
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL');
  client = neon(DATABASE_URL);
  return client;
}

async function crearTablas() {
  const q = sql();
  await q.transaction([
    q`create table if not exists socios (
        id serial primary key,
        nombre text not null default '',
        telefono text not null default '',
        estado text not null default 'contactar',
        nota text not null default '',
        origen text not null default 'equipo',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )`,
    q`create table if not exists config (
        id int primary key default 1 check (id = 1),
        ajuste int not null default 0,
        sonido text not null default 'carillon',
        ping int not null default 0,
        qr boolean not null default false,
        updated_at timestamptz not null default now()
      )`,
    q`insert into config (id) values (1) on conflict do nothing`,
    q`create table if not exists dispositivos (
        device text primary key,
        socio_id int,
        estado text not null,
        created_at timestamptz not null default now()
      )`,
  ]);
}

/** Ejecuta `fn` y, si las tablas aún no existen (42P01), las crea y reintenta una vez. */
async function conTablas<T>(fn: (q: NeonQueryFunction<false, false>) => Promise<T>): Promise<T> {
  try {
    return await fn(sql());
  } catch (err) {
    if ((err as { code?: string }).code !== '42P01') throw err;
    await crearTablas();
    return fn(sql());
  }
}

/* ------------------------------------------------------------------ */
/*  Lectura                                                            */
/* ------------------------------------------------------------------ */

type Fila = Record<string, unknown>;

const aSocio = (r: Fila): Socio => ({
  id: Number(r.id),
  nombre: String(r.nombre ?? ''),
  telefono: String(r.telefono ?? ''),
  estado: (ESTADO_IDS as string[]).includes(String(r.estado)) ? (r.estado as EstadoId) : ESTADO_DEFECTO,
  nota: String(r.nota ?? ''),
  origen: r.origen === 'qr' ? 'qr' : 'equipo',
  creado: new Date(r.created_at as string).toISOString(),
});

const aConfig = (r: Fila | undefined): Config => ({
  ajuste: Number(r?.ajuste ?? 0),
  sonido: String(r?.sonido ?? 'carillon'),
  ping: Number(r?.ping ?? 0),
  qr: Boolean(r?.qr),
});

/** Lo justo para la pantalla del contador: se pide cada 2 s. */
export function leerContador() {
  return conTablas(async (q) => {
    const [r] = await q`
      select (select count(*)::int from socios) as n, c.ajuste, c.sonido, c.ping, c.qr
      from config c where c.id = 1`;
    const config = aConfig(r);
    return { total: Math.max(0, Number(r?.n ?? 0) + config.ajuste), ...config };
  });
}

/** Todo lo que ve el panel del equipo. */
export function leerPanel() {
  return conTablas(async (q) => {
    const [filas, [c]] = await q.transaction([q`select * from socios order by id desc`, q`select * from config where id = 1`]);
    const socios = (filas as Fila[]).map(aSocio);
    const config = aConfig(c as Fila);
    return { socios, config, ...resumen(socios, config) };
  });
}

export function resumen(socios: Socio[], config: Config) {
  const existentes = socios.filter((s) => s.estado === 'ya_socio').length;
  return {
    total: Math.max(0, socios.length + config.ajuste),
    nuevos: socios.length - existentes,
    existentes,
  };
}

/* ------------------------------------------------------------------ */
/*  Escritura                                                          */
/* ------------------------------------------------------------------ */

export type DatosSocio = { nombre?: unknown; telefono?: unknown; estado?: unknown; nota?: unknown };

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const telefono = (v: unknown) => (typeof v === 'string' ? v.replace(/[^\d+]/g, '').slice(0, 16) : '');
const estado = (v: unknown): EstadoId | null => ((ESTADO_IDS as unknown[]).includes(v) ? (v as EstadoId) : null);

export function limpiar(d: DatosSocio) {
  return {
    nombre: texto(d.nombre, 120),
    telefono: telefono(d.telefono),
    estado: estado(d.estado),
    nota: typeof d.nota === 'string' ? d.nota.trim().slice(0, 600) : '',
  };
}

export function crearSocio(d: DatosSocio, origen: Origen = 'equipo') {
  const s = limpiar(d);
  return conTablas(async (q) => {
    const [r] = await q`
      insert into socios (nombre, telefono, estado, nota, origen)
      values (${s.nombre}, ${s.telefono}, ${s.estado ?? ESTADO_DEFECTO}, ${s.nota}, ${origen})
      returning *`;
    return aSocio(r);
  });
}

export function editarSocio(id: number, d: DatosSocio) {
  const s = limpiar(d);
  return conTablas(async (q) => {
    const [r] = await q`
      update socios set
        nombre = case when ${d.nombre !== undefined} then ${s.nombre} else nombre end,
        telefono = case when ${d.telefono !== undefined} then ${s.telefono} else telefono end,
        estado = coalesce(${s.estado}, estado),
        nota = case when ${d.nota !== undefined} then ${s.nota} else nota end,
        updated_at = now()
      where id = ${id}
      returning *`;
    return r ? aSocio(r) : null;
  });
}

export function borrarSocio(id: number) {
  return conTablas(async (q) => {
    const filas = await q`delete from socios where id = ${id} returning id`;
    return filas.length > 0;
  });
}

const SONIDO_IDS: string[] = SONIDOS.map((s) => s.id);

export type CambiosConfig = { total?: unknown; sonido?: unknown; ping?: unknown; qr?: unknown };

/** `total` fija el número que se ve: guarda la diferencia con las filas como ajuste. */
export function cambiarConfig(c: CambiosConfig) {
  const total = typeof c.total === 'number' && Number.isFinite(c.total) ? Math.max(0, Math.min(99999, Math.round(c.total))) : null;
  const sonido = typeof c.sonido === 'string' && SONIDO_IDS.includes(c.sonido) ? c.sonido : null;
  const ping = c.ping === true;
  const qr = typeof c.qr === 'boolean' ? c.qr : null;
  return conTablas(async (q) => {
    const [r] = await q`
      update config set
        ajuste = case when ${total !== null} then ${total ?? 0}::int - (select count(*)::int from socios) else ajuste end,
        sonido = coalesce(${sonido}, sonido),
        ping = ping + ${ping ? 1 : 0},
        qr = coalesce(${qr}::boolean, qr),
        updated_at = now()
      where id = 1
      returning *`;
    return aConfig(r);
  });
}

/* ------------------------------------------------------------------ */
/*  QR público: una respuesta por dispositivo                          */
/* ------------------------------------------------------------------ */

export type TipoQr = 'contactar' | 'alta_web' | 'ya_socio';
export const TIPOS_QR: TipoQr[] = ['contactar', 'alta_web', 'ya_socio'];

/** Cuánto «pesa» cada respuesta: si ya había contestado, solo puede ir a más. */
const RANGO: Record<TipoQr, number> = { contactar: 0, alta_web: 1, ya_socio: 1 };

export function leerDispositivo(device: string) {
  return conTablas(async (q) => {
    const [r] = await q`select estado from dispositivos where device = ${device}`;
    return r ? (String(r.estado) as TipoQr) : null;
  });
}

/**
 * Apunta la respuesta del QR. Cada dispositivo suma como mucho una vez: si ya
 * contestó, solo se actualiza su fila (p. ej. de «llamadme» a «ya me he dado de
 * alta») y el contador no se mueve. Si el equipo borró su fila, no vuelve a sumar.
 */
export function respuestaQr(device: string, tipo: TipoQr, d: DatosSocio) {
  const s = limpiar(d);
  return conTablas(async (q) => {
    // Una sola sentencia: si el dispositivo ya existía no se inserta nada (aunque lleguen dos a la vez)
    const nuevas = await q`
      with d as (
        insert into dispositivos (device, estado, socio_id)
        values (${device}, ${tipo}, nextval(pg_get_serial_sequence('socios', 'id')))
        on conflict (device) do nothing
        returning socio_id
      )
      insert into socios (id, nombre, telefono, estado, nota, origen)
      select socio_id, ${s.nombre}, ${s.telefono}, ${tipo}, ${s.nota}, 'qr' from d
      returning id`;
    if (nuevas.length) return { nuevo: true, estado: tipo };

    const [previo] = await q`select socio_id, estado from dispositivos where device = ${device}`;
    const antes = String(previo?.estado ?? tipo) as TipoQr;
    if (!previo || RANGO[tipo] <= RANGO[antes]) return { nuevo: false, estado: antes };
    await q.transaction([
      q`update dispositivos set estado = ${tipo} where device = ${device}`,
      q`update socios set
          estado = ${tipo},
          nombre = case when nombre = '' then ${s.nombre} else nombre end,
          nota = case when ${s.nota} = '' then nota when nota = '' then ${s.nota} else nota || ' · ' || ${s.nota} end,
          updated_at = now()
        where id = ${previo.socio_id as number}`,
    ]);
    return { nuevo: false, estado: tipo };
  });
}
