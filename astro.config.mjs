// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Dirección pública de la web. Mientras delwenfest.movimientoconsolacion.com no
  // tenga su registro DNS, usamos la de Vercel (si no, WhatsApp no ve la imagen).
  site: process.env.SITE_URL || 'https://delwenfest.vercel.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
});
