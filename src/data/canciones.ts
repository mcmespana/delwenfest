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
export const PLAYLIST = 'https://open.spotify.com/playlist/2Kmmyw3zo99OvNZdti9jUH';

export const CANCIONES: Cancion[] = [
  // El número de cada canción es su posición en la playlist (y el del listado impreso).
  { n: 1, titulo: 'Madre Tierra', artista: 'Chayanne', spotify: '2wlptOJ1g5fvLdu6ruKCKU' },
  { n: 2, titulo: 'La Bamba', artista: 'Ritchie Valens / Los Lobos', spotify: '0uMMLry3hzWGn3q3loqMkm' },
  { n: 3, titulo: 'Torero', artista: 'Chayanne', spotify: '709CndJJB3GTUhQD0LLFse' },
  { n: 4, titulo: 'La Macarena', artista: 'Los del Río', spotify: '4Y6cDd4EPHcEbiUKdyvNwM' },
  { n: 5, titulo: 'Aserejé', artista: 'Las Ketchup', spotify: '6NG2IIXZfC5Notpz0GIODU' },
  { n: 6, titulo: 'Waka Waka', artista: 'Shakira', spotify: '0W8nDs4H2cqxxAgszNMYO3' },
  { n: 7, titulo: 'Color Esperanza', artista: 'Diego Torres', spotify: '3T07pNAEVr9adeIG9i1ex4' },
  { n: 8, titulo: 'La Bicicleta', artista: 'Carlos Vives y Shakira', spotify: '0sXvAOmXgjR2QUqLK1MltU' },
  { n: 9, titulo: 'La Flaca', artista: 'Jarabe de Palo', spotify: '2LsbizbOeNa4x6qsi2jAMb' },
  { n: 10, titulo: 'Me gustas tú', artista: 'Manu Chao', spotify: '6b37xrsNCWYIUphFBazqD6' },
  { n: 11, titulo: 'El Secreto de las Tortugas', artista: 'Maldita Nerea', spotify: '1sMgCr1RH0HfAazVZt9xmZ' },
  { n: 12, titulo: 'Por la boca vive el pez', artista: 'Fito y Fitipaldis', spotify: '24UStI5AYA7g5ufFDh3LH0' },
  { n: 13, titulo: 'Caminando por la Vida', artista: 'Melendi', spotify: '3v1dCP3hk2djfWryqfp7sx' },
  { n: 14, titulo: 'Yo Quiero Bailar', artista: 'Sonia y Selena', spotify: '4rFCPjKfgbEeNvs1Ku4nbd' },
  { n: 15, titulo: 'La Canción del Velero', artista: 'La Fiesta', spotify: '1wV4Iied30083fVXBMJpJV' },
  { n: 16, titulo: 'Bailando', artista: 'Enrique Iglesias', spotify: '6PSKhwo0mVcOdjUOhVJd5p' },
  { n: 17, titulo: 'Danza Kuduro', artista: 'Don Omar', spotify: '2a1o6ZejUi8U3wzzOtCOYw' },
  { n: 18, titulo: 'Superestrella', artista: 'Aitana', spotify: '6hpuesKPNa3WhV48O7Fa47' },
  { n: 19, titulo: 'Potra Salvaje', artista: 'Isabel Aaiún', spotify: '0ZCcn4YcRnz6jLTRJcCKoW' },
  { n: 20, titulo: 'La Bachata', artista: 'Manuel Turizo', spotify: '5ww2BF9slyYgNOk37BlC4u' },
  { n: 21, titulo: 'Libertad', artista: 'Nil Moliner', spotify: '1kG7gfH4HDUlDht0VZYkiP' },
  { n: 22, titulo: 'Tacones Rojos', artista: 'Sebastián Yatra', spotify: '0Be7sopyKMv8Y8npsUkax2' },
  { n: 23, titulo: 'Si Antes Te Hubiera Conocido', artista: 'Karol G', spotify: '6WatFBLVB0x077xWeoVc2k' },
  { n: 24, titulo: 'Olvidé Olvidarte', artista: 'Marlon y Álvaro de Luna', spotify: '6nys7RehgP4R0KzSVGm3CI' },
  { n: 25, titulo: 'Ave María', artista: 'David Bisbal', spotify: '5U4pDBaeq2Jl2dKuWWUSsh' },
  { n: 26, titulo: 'Pan y Mantequilla', artista: 'Efecto Pasillo', spotify: '2kZJ5wrpq1gCdHmVEjahoH' },
  { n: 27, titulo: 'Mi religión', artista: 'Nil Moliner', spotify: '5zNlrLpJFZt3RvRe9A0Hed' },
  { n: 28, titulo: 'Bailemos', artista: 'Dani Fernández', spotify: '5EnaxC9amhXY55ezw87SL8' },
  { n: 29, titulo: 'Juramento Eterno de Sal', artista: 'Álvaro de Luna', spotify: '23E53f3C9SJ9MqBh1f6hEw' },
  { n: 30, titulo: 'La Gozadera', artista: 'Gente de Zona y Marc Anthony', spotify: '0OMRAvrtLWE2TvcXorRiB9' },
  { n: 31, titulo: 'Bailando por ahí', artista: 'Juan Magán', spotify: '6sHBvzRsuGunQTfCk18KXi' },
  { n: 32, titulo: 'Carita de Buena', artista: 'Efecto Pasillo', spotify: '7lcqRNyQgqWHOuBb6pAsmr' },
  { n: 33, titulo: 'Adiós', artista: 'Ricky Martin', spotify: '13FdGdz4KnwH8UIX5JxO8r' },
  { n: 34, titulo: 'Nochentera', artista: 'Vicco', spotify: '20CozgjF6bshBw8cLhN23B' },
  { n: 35, titulo: 'El Mismo Sol', artista: 'Álvaro Soler', spotify: '4OKmYJF7Wk8uJxv68wFH0j' },
  { n: 36, titulo: 'Peter Pan', artista: 'El Canto del Loco', spotify: '1gkBsKxTpVHIn1nLf05CUo' },
  { n: 37, titulo: 'Dile a los Demás', artista: 'Dani Fernández', spotify: '4iK6NFBfZ94xd6UJ0dHVoh' },
  { n: 38, titulo: 'Corazón Latino', artista: 'David Bisbal', spotify: '36inQzyICgt9y0jddpVQe1' },
  { n: 39, titulo: 'Cómo Te Atreves', artista: 'Morat', spotify: '7M6CFruBrM5x7u0lTMtm6r' },
  { n: 40, titulo: 'A Dios le Pido', artista: 'Juanes', spotify: '129lYDVKnWtlJc2PZJviuA' },
  { n: 41, titulo: 'Las Babys', artista: 'Aitana', spotify: '1FhRIZtz1d4qLVe4928exT' },
  { n: 42, titulo: 'Volando Voy', artista: 'Kiko Veneno', spotify: '1Hud0EePGdcqcHIIDksq3R' },
  { n: 43, titulo: 'Un Beso y una Flor', artista: 'Nino Bravo', spotify: '5IU4JO2cpa0wPK8oQWFfCr' },
  { n: 44, titulo: 'La Camisa Negra', artista: 'Juanes', spotify: '2EM9zpAc7PVeoAydmbfVIL' },
  { n: 45, titulo: 'Mi Gran Noche', artista: 'Raphael', spotify: '6Tnnk7MAnZiDx67DJN2hnx' },
  { n: 46, titulo: 'Vivir Así es Morir de Amor', artista: 'Camilo Sesto', spotify: '3yzHIAzk3zVE1WgspS8W21' },
  { n: 47, titulo: 'Antes de que cuente diez', artista: 'Fito y Fitipaldis', spotify: '3xiNRrrVROKlHrflHGNTfG' },
  { n: 48, titulo: 'El Principio de Algo', artista: 'La La Love You', spotify: '10KB4HkYIpNOd0QhyohMre' },
  { n: 49, titulo: 'Zapatillas', artista: 'El Canto del Loco', spotify: '42VgiRyg0YjtRVLiPFNxPJ' },
  { n: 50, titulo: 'Sofía', artista: 'Álvaro Soler', spotify: '5vj59ONIVbyhcrI8ZSwoRo' },
  { n: 51, titulo: 'Humanos a Marte', artista: 'Chayanne', spotify: '7lOzUJzsELALh5FQsPKTEn' },
  { n: 52, titulo: 'Yo Contigo, Tú Conmigo', artista: 'Morat y Álvaro Soler', spotify: '12HWO1YYMV9HEqQpava5zm' },
  { n: 53, titulo: 'La chica yeyé', artista: 'Concha Velasco', spotify: '5hv3nMY3NKyDL7cSsrSYog' },
  { n: 54, titulo: 'Como una Ola', artista: 'Rocío Jurado', spotify: '1gNXYvLc14OmqK6gSJKLUM' },
  { n: 55, titulo: 'Volverte a Ver', artista: 'Juanes', spotify: '2ZqFfDwNjKvPu3USx3onhO' },
  { n: 56, titulo: 'Como Camarón', artista: 'Estopa', spotify: '1VB4sadHjFcFklHcZuoROi' },
  { n: 57, titulo: 'Hijos de la Tierra', artista: 'Nil Moliner', spotify: '3XvMGisPMosHlT5oOg2E7N' },
  { n: 58, titulo: 'Que Nada Nos Pare', artista: 'La La Love You', spotify: '4GSoje6d1GSN7iFEH1H55f' },
  { n: 59, titulo: 'Volar', artista: 'Álvaro Soler', spotify: '2HDFTyYRVp9qfzJi2hDrjz' },
  { n: 60, titulo: 'Bailando Bachata', artista: 'Chayanne', spotify: '0nKu6ysQjldXxABnxMu7kL' },
  { n: 61, titulo: 'Despiertos', artista: 'Álvaro Soler', spotify: '5srORBagF2t9Yesjh6C75r' },
  { n: 62, titulo: 'La Morocha', artista: 'Luck Ra', spotify: '7aPsseax6rNFyipHn9A5CR' },
  { n: 63, titulo: 'Dai Dai', artista: 'Shakira', spotify: '0kosUz0jePvjiz4ctmR6wL' },
  { n: 64, titulo: 'Todos los Días Sale el Sol', artista: 'Bongo Botrako', spotify: '6w43MFeF8LzxfInM0C7Tui' },
  { n: 65, titulo: 'El Tiburón', artista: 'Henry Méndez', spotify: '01uMKtUs3Ubu6ZrWhO96cn' },
  { n: 66, titulo: 'Cuando Zarpa el Amor', artista: 'Camela', spotify: '0GzQB5WXavUEU8tfTCAd8m' },
  { n: 67, titulo: 'Vivir Así es Morir de Amor', artista: 'Camilo Sesto', spotify: '3yzHIAzk3zVE1WgspS8W21' },
  { n: 68, titulo: 'Tu jardín con enanitos', artista: 'Melendi', spotify: '6yCjU5j6YHbux2VQCBTTE1' },
  { n: 69, titulo: '20 de Enero', artista: 'La Oreja de Van Gogh', spotify: '4XdePl1vOF1cYjTBYeYU9j' },
  { n: 70, titulo: 'Tenía tanto que darte', artista: 'Nena Daconte', spotify: '3Th2of8xIYyImVLXUbzaTp' },
  { n: 71, titulo: 'Física o química', artista: 'Despistaos', spotify: '79eUc9cUUoUOO1b5znphiU' },
  { n: 72, titulo: 'Puedes Contar Conmigo', artista: 'La Oreja de Van Gogh', spotify: '1hbWtHgRDG25DkmxE4I28V' },
  { n: 73, titulo: 'Soldadito Marinero', artista: 'Fito y Fitipaldis', spotify: '0eVborSuxUeSg0meWYd9dZ' },
  { n: 74, titulo: 'Ella No Sigue Modas', artista: 'Juan Magán', spotify: '0x6UyfOikAQ7GpiGaYaPey' },
  { n: 75, titulo: 'Por Fin Te Encontré', artista: 'Cali y El Dandee, Juan Magán y Sebastián Yatra', spotify: '2DAULesb1U4Qz4FSTZpEUJ' },
  { n: 76, titulo: 'He Llorado (como un niño)', artista: 'Juan Magán y Gente de Zona', spotify: '72iOihHEQp0LA0hZcjfLaA' },
  { n: 77, titulo: 'La isla del amor', artista: 'Demarco Flamenco y Maki', spotify: '0Gw9QC3RqHmTdGqHIWLHb6' },
  { n: 78, titulo: 'No Importa que Llueva', artista: 'Efecto Pasillo', spotify: '1suTz9wOBk6pF2OAAgKFve' },
  { n: 79, titulo: 'Princesas', artista: 'Pereza', spotify: '3hlWUNjAlbZ6nOjAbrivBv' },
  { n: 80, titulo: 'Como Si Fueras a Morir Mañana', artista: 'Leiva', spotify: '4aAfLSx9IthpC3Pw5pNk3E' },
  { n: 81, titulo: 'Cuando me siento bien', artista: 'Efecto Pasillo', spotify: '2xUl8Bp6eLddk5mdv8I2Wo' },
  { n: 82, titulo: 'La vereda de la puerta de atrás', artista: 'Extremoduro', spotify: '4kJP8Z888wREJ8bRMWNMuk' },
  { n: 83, titulo: 'Marta, Sebas, Guille y los demás', artista: 'Amaral', spotify: '30ddpolNHwXlrS5XO8MiiO' },
  { n: 84, titulo: 'En qué estrella estará', artista: 'Nena Daconte', spotify: '1msphInQ8bBBQGFZkll7FX' },
  { n: 85, titulo: 'Te regalo', artista: 'Carlos Baute', spotify: '0fmgOwkb9AwgzXhYVSZRDs' },
  { n: 86, titulo: 'Sarandonga', artista: 'Lolita', spotify: '2zNDRGoRkNEkMhO5fcGTMv' },
  { n: 87, titulo: 'La Graciosa', artista: 'Quevedo', spotify: '0b3Bkp0UfCkNqquAUmoP5m' },
  { n: 88, titulo: 'La roja baila', artista: 'Sergio Ramos, Niña Pastori y RedOne', spotify: '5EbklL3iBxWedD57pMIFXM' },
  { n: 89, titulo: 'Viva La Vida', artista: 'Coldplay', spotify: '1mea3bSkSGXuIRvnydlB5b' },
  { n: 90, titulo: 'Limbo', artista: 'Daddy Yankee', spotify: '3pDhN3qB33AOPhQEkUCaWt' },
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
