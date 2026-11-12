import { cuerpo, json, seguro } from '../../../lib/api';
import { borrarSocio, editarSocio } from '../../../lib/db';

export const prerender = false;

const idValido = (v: string | undefined) => (v && /^\d{1,9}$/.test(v) ? Number(v) : null);

export const PATCH = seguro(async ({ params, request }) => {
  const id = idValido(params.id);
  if (id === null) return json({ error: 'Id no válido' }, 400);
  const socio = await editarSocio(id, await cuerpo(request));
  return socio ? json({ socio }) : json({ error: 'No existe' }, 404);
});

export const DELETE = seguro(async ({ params }) => {
  const id = idValido(params.id);
  if (id === null) return json({ error: 'Id no válido' }, 400);
  return json({ ok: await borrarSocio(id) });
});
