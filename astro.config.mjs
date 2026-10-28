// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/** Pantallas internas del equipo: fuera del sitemap y de los buscadores. */
const INTERNAS = ['/bingo'];

export default defineConfig({
  // Dirección pública de la web. Mientras delwenfest.movimientoconsolacion.com no
  // tenga su registro DNS, usamos la de Vercel (si no, WhatsApp no ve la imagen).
  site: process.env.SITE_URL || 'https://delwenfest.vercel.app',
  // Todo sigue siendo estático salvo /api, que guarda los datos del equipo en la base de datos.
  adapter: vercel(),
  env: {
    schema: {
      // Neon Postgres (Vercel → Settings → Environment Variables). Se lee al ejecutar, no se incrusta.
      // Nombre propio para no confundirla con otra DATABASE_URL del entorno.
      SOCIOS_DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [sitemap({ filter: (page) => !INTERNAS.some((p) => new URL(page).pathname.startsWith(p)) })],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
});
