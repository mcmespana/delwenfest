import { cuerpo, json, seguro } from '../../lib/api';
import { borrarPremio, cambiarPremio, crearPremio, guardarNotas, leerEstado, marcarSonada, nuevaPartida } from '../../lib/bingo';

export const prerender = false;

export const GET = seguro(async () => json(await leerEstado()));

/** Una sola ruta para todo lo que se toca desde /bingo: { accion, ... }. */
export const POST = seguro(async ({ request }) => {
  const b = await cuerpo(request);
  switch (b.accion) {
    case 'premio':
      if (!(await cambiarPremio(b.id, b.campo, b.valor))) return json({ error: 'Premio no encontrado' }, 404);
      return json({ ok: true });
    case 'nuevo-premio':
      return json({ premio: await crearPremio(b.tipo) });
    case 'borrar-premio':
      await borrarPremio(b.id);
      return json({ ok: true });
    case 'sonada':
      await marcarSonada(b.numero, b.sonada !== false);
      return json({ ok: true });
    case 'nueva-partida':
      await nuevaPartida();
      return json({ ok: true });
    case 'notas':
      await guardarNotas(b.texto);
      return json({ ok: true });
    default:
      return json({ error: 'Acción desconocida' }, 400);
  }
});
