import { cuerpo, json, seguro } from '../../../lib/api';
import { crearSocio, leerPanel } from '../../../lib/db';

export const prerender = false;

export const GET = seguro(async () => json(await leerPanel()));

export const POST = seguro(async ({ request }) => {
  const socio = await crearSocio(await cuerpo(request));
  return json({ socio }, 201);
});
