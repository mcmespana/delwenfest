/*
 * Canciones del bingo musical: el número del bombo → la canción que hay que poner.
 *
 * Para rellenarla basta con pegar cada canción con su número, título, artista y el
 * enlace de Spotify (botón «Compartir → Copiar enlace de la canción»). Vale el enlace
 * entero, la URI (spotify:track:…) o solo el ID. Si falta el enlace, /bingo busca la
 * canción en Spotify por título y artista.
 */

export interface Cancion {
  n: number;
  titulo: string;
  artista: string;
  spotify?: string;
}

/** Enlace a la playlist entera (opcional). */
export const PLAYLIST = '';

export const CANCIONES: Cancion[] = [
  // { n: 1, titulo: 'Título', artista: 'Artista', spotify: 'https://open.spotify.com/track/…' },
];

export const TOTAL = 90;

const ID = /^[A-Za-z0-9]{22}$/;

/** Saca el ID de pista de un enlace, una URI o el propio ID. */
export function trackId(ref?: string): string | null {
  if (!ref) return null;
  const s = ref.trim();
  if (ID.test(s)) return s;
  const m = s.match(/track[/:]([A-Za-z0-9]{22})/);
  return m ? m[1] : null;
}

/** Enlaces listos para la página: web (abre la app en el móvil), URI de la app y búsqueda. */
export function enlaces(c: Cancion) {
  const id = trackId(c.spotify);
  const q = encodeURIComponent(`${c.titulo} ${c.artista}`.trim());
  return {
    web: id ? `https://open.spotify.com/track/${id}` : `https://open.spotify.com/search/${q}`,
    app: id ? `spotify:track:${id}` : `spotify:search:${q}`,
    exacta: Boolean(id),
  };
}
