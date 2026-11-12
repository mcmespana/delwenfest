import { json, seguro } from '../../lib/api';
import { leerContador } from '../../lib/db';

export const prerender = false;

export const GET = seguro(async () => json(await leerContador()));
