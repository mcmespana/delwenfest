// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/** Pantallas internas del equipo: fuera del sitemap y de los buscadores. */
const INTERNAS = ['/equipo', '/contador'];

export default defineConfig({
  // Dirección pública de la web (también es la que lleva el QR de /hazte-socio).
  site: process.env.SITE_URL || 'https://delwenfest.movimientoconsolacion.com',
  // Todo sigue siendo estático salvo /api, que guarda los socios en la base de datos.
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
