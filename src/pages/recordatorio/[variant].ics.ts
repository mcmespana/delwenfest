import type { APIRoute, GetStaticPaths } from 'astro';
import { alarmVariants, buildIcs, variantSlug, type AlarmKey } from '../../lib/ics';

export const getStaticPaths = (() =>
  alarmVariants().map((keys) => ({ params: { variant: variantSlug(keys) }, props: { keys } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(buildIcs(props.keys as AlarmKey[]), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
