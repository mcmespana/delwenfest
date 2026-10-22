import type { APIRoute } from 'astro';
import { buildIcs, DEFAULT_ALARMS } from '../lib/ics';

export const GET: APIRoute = () =>
  new Response(buildIcs(DEFAULT_ALARMS), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
