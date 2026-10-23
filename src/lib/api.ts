import type { APIContext } from 'astro';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/** Lee el cuerpo JSON sin romper si llega vacío o mal formado. */
export async function cuerpo(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

/** Envuelve un endpoint para que cualquier fallo de la base de datos devuelva un 500 legible. */
export const seguro =
  (fn: (ctx: APIContext) => Promise<Response>) =>
  async (ctx: APIContext) => {
    try {
      return await fn(ctx);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error && err.message === 'Falta SOCIOS_DATABASE_URL' ? 'La base de datos no está conectada' : 'Error de la base de datos';
      return json({ error: msg }, 500);
    }
  };
