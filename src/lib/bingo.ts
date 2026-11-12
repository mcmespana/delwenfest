/*
 * Datos compartidos del bingo musical (Neon Postgres, misma base de datos que los
 * socios: variable SOCIOS_DATABASE_URL). Tablas bingo_premios, bingo_sonadas y bingo_notas.
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { SOCIOS_DATABASE_URL } from 'astro:env/server';

export type TipoPremio = 'principal' | 'pizza' | 'secundario';

export interface Premio {
  id: number;
  tipo: TipoPremio;
  orden: number;
  titulo: string;
  premio: string;
  numero: number | null;
  criterio: string;
  ganador: string;
}

export interface EstadoBingo {
  premios: Premio[];
  sonadas: number[];
  notas: string;
}

const TIPOS: TipoPremio[] = ['principal', 'pizza', 'secundario'];
const CAMPOS_TEXTO = ['titulo', 'premio', 'criterio', 'ganador'] as const;

let client: NeonQueryFunction<false, false> | null = null;

function sql() {
  if (client) return client;
  if (!SOCIOS_DATABASE_URL) throw new Error('Falta SOCIOS_DATABASE_URL');
  client = neon(SOCIOS_DATABASE_URL);
  return client;
}

async function crearTablas() {
  const q = sql();
  await q.transaction([
    q`create table if not exists bingo_premios (
        id serial primary key,
        tipo text not null check (tipo in ('principal','pizza','secundario')),
        orden int not null default 0,
        titulo text not null default '',
        premio text not null default '',
        numero int check (numero between 1 and 90),
        criterio text not null default '',
        ganador text not null default '',
        updated_at timestamptz not null default now()
      )`,
    q`create table if not exists bingo_sonadas (
        numero int primary key check (numero between 1 and 90),
        created_at timestamptz not null default now()
      )`,
    q`create table if not exists bingo_notas (
        id int primary key default 1 check (id = 1),
        texto text not null default '',
        updated_at timestamptz not null default now()
      )`,
    q`insert into bingo_notas (id) values (1) on conflict do nothing`,
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

const texto = (v: unknown, max = 300) => String(v ?? '').slice(0, max);
const numero = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 90 ? n : null;
};

export const leerEstado = () =>
  conTablas(async (q): Promise<EstadoBingo> => {
    const [premios, sonadas, notas] = await q.transaction([
      q`select id, tipo, orden, titulo, premio, numero, criterio, ganador from bingo_premios order by tipo, orden, id`,
      q`select numero from bingo_sonadas order by created_at`,
      q`select texto from bingo_notas where id = 1`,
    ]);
    return {
      premios: premios as Premio[],
      sonadas: sonadas.map((r) => r.numero as number),
      notas: (notas[0]?.texto as string) ?? '',
    };
  });

export const crearPremio = (tipo: unknown) =>
  conTablas(async (q) => {
    const t = TIPOS.includes(tipo as TipoPremio) ? (tipo as TipoPremio) : 'secundario';
    const [p] = await q`
      insert into bingo_premios (tipo, orden)
      values (${t}, coalesce((select max(orden) from bingo_premios where tipo = ${t}), 0) + 1)
      returning id, tipo, orden, titulo, premio, numero, criterio, ganador`;
    return p as Premio;
  });

/** Cambia un solo campo de un premio: así dos personas editando a la vez no se pisan. */
export const cambiarPremio = (id: unknown, campo: unknown, valor: unknown) =>
  conTablas(async (q) => {
    const pid = Number(id);
    if (!Number.isInteger(pid)) return null;
    let filas;
    if (campo === 'numero') {
      filas = await q`update bingo_premios set numero = ${numero(valor)}, updated_at = now() where id = ${pid} returning id`;
    } else if ((CAMPOS_TEXTO as readonly unknown[]).includes(campo)) {
      // El nombre de columna sale de la lista cerrada de arriba, nunca del cliente tal cual.
      const col = campo as (typeof CAMPOS_TEXTO)[number];
      filas = await q.query(`update bingo_premios set ${col} = $1, updated_at = now() where id = $2 returning id`, [texto(valor), pid]);
    } else return null;
    return filas.length > 0;
  });

export const borrarPremio = (id: unknown) =>
  conTablas(async (q) => {
    await q`delete from bingo_premios where id = ${Number(id)} and tipo = 'secundario'`;
  });

export const marcarSonada = (n: unknown, sonada: boolean) =>
  conTablas(async (q) => {
    const num = numero(n);
    if (num === null) return;
    if (sonada) await q`insert into bingo_sonadas (numero) values (${num}) on conflict do nothing`;
    else await q`delete from bingo_sonadas where numero = ${num}`;
  });

export const nuevaPartida = () => conTablas((q) => q`delete from bingo_sonadas`);

export const guardarNotas = (t: unknown) =>
  conTablas((q) => q`update bingo_notas set texto = ${texto(t, 20000)}, updated_at = now() where id = 1`);
