import { cuerpo, json, seguro } from '../../lib/api';
import { cambiarConfig } from '../../lib/db';

export const prerender = false;

export const POST = seguro(async ({ request }) => json({ config: await cambiarConfig(await cuerpo(request)) }));
