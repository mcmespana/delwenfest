import { cuerpo, json, seguro } from '../../lib/api';
import { leerDispositivo, respuestaQr, TIPOS_QR, type TipoQr } from '../../lib/db';

export const prerender = false;

const COOKIE = 'dwf_dispositivo';
const valido = (v: unknown): v is string => typeof v === 'string' && /^[\w-]{16,64}$/.test(v);

/** El dispositivo se reconoce por la cookie y, si se ha borrado, por el id guardado en el navegador. */
function dispositivo(cookie: string | undefined, enviado: unknown) {
  if (valido(cookie)) return cookie;
  if (valido(enviado)) return enviado;
  return null;
}

export const GET = seguro(async ({ cookies, url }) => {
  const device = dispositivo(cookies.get(COOKIE)?.value, url.searchParams.get('d'));
  return json({ estado: device ? await leerDispositivo(device) : null });
});

export const POST = seguro(async ({ cookies, request }) => {
  const body = await cuerpo(request);
  const device = dispositivo(cookies.get(COOKIE)?.value, body.device);
  if (!device) return json({ error: 'Falta el dispositivo' }, 400);
  if (!TIPOS_QR.includes(body.tipo as TipoQr)) return json({ error: 'Respuesta no válida' }, 400);
  const tipo = body.tipo as TipoQr;
  if (tipo === 'contactar' && (typeof body.telefono !== 'string' || body.telefono.replace(/\D/g, '').length < 9)) {
    return json({ error: 'Necesitamos un teléfono para llamarte' }, 400);
  }
  const res = await respuestaQr(device, tipo, body);
  cookies.set(COOKIE, device, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', secure: true, httpOnly: true });
  return json(res);
});
