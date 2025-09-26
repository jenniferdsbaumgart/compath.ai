// services/placesService.ts
// MODO DEMO: gera dados mockados (offline) para parecer "tudo ok" na apresentação.
import "dotenv/config";

export type Place = {
  fsq_id: string;
  name: string;
  url?: string;
  address?: string;
  reviewCount?: number;
  rating?: number;
  popularity?: number;
  source: "foursquare"; // mantido por compat com o front; pode trocar se quiser
};

type SearchOpts = {
  limit?: number;
  categories?: string | number | Array<string | number>;
  radiusMeters?: number;
};

/* ----------------------- Utils de aleatoriedade estável -------------------- */
// xmur3 + mulberry32 (seeded RNG determinístico)
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed: string) {
  return mulberry32(xmur3(seed)());
}
function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}
function clamp(n: number, a: number, b: number) {
  return Math.min(Math.max(n, a), b);
}

/* --------------------------- Geração de nomes/URLs ------------------------- */
const brNeighborhoods = [
  "Centro",
  "Garcia",
  "Velha",
  "Itoupava Norte",
  "Ponta Aguda",
  "Vila Nova",
  "Fortaleza",
  "Passo Manso",
  "Escola Agrícola",
  "Salto",
  "Água Verde",
];
const nameSuffixes = [
  "Prime",
  "Studio",
  "Express",
  "Master",
  "Vip",
  "& Co.",
  "Dois Irmãos",
  "da Praça",
  "do Centro",
  "Alternativa",
  "Criativa",
];
const barbeariaWords = [
  "Barbearia",
  "Cortes",
  "Navalha",
  "Barba & Bigode",
  "Old School",
];
const cafeWords = ["Café", "Coffee", "Torra", "Grãos", "Bistrô"];
const farmaciaWords = ["Farmácia", "Drogaria", "Popular", "Vida", "Bem-Estar"];

function topicWords(topic: string): string[] {
  const t = topic.toLowerCase();
  if (t.includes("barbear")) return barbeariaWords;
  if (t.includes("café") || t.includes("cafe")) return cafeWords;
  if (t.includes("farm")) return farmaciaWords;
  // fallback
  return [topic.charAt(0).toUpperCase() + topic.slice(1)];
}

function toSlug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fakeAddress(rng: () => number) {
  const nbh = pick(rng, brNeighborhoods);
  const num = Math.floor(rng() * 900) + 50;
  return `${nbh}, ${num} - Blumenau, SC`;
}

function fakeName(rng: () => number, topic: string) {
  const base = pick(rng, topicWords(topic));
  const suf = rng() < 0.6 ? " " + pick(rng, nameSuffixes) : "";
  // um nome “humano”
  const prefixPool = [
    "São Jorge",
    "Do Vale",
    "Nobre",
    "Lumen",
    "Garcia",
    "Monet",
    "Fênix",
    "Aurora",
    "Villa",
  ];
  const maybePrefix = rng() < 0.4 ? pick(rng, prefixPool) + " " : "";
  return `${maybePrefix}${base}${suf}`;
}

function fakeUrl(name: string) {
  return `https://example.com/${toSlug(name)}`;
}

function fakePlace(rng: () => number, topic: string, i: number): Place {
  const name = fakeName(rng, topic);
  const reviewCount = Math.floor(rng() * 1800 + rng() * 200 + 5); // 5..~2000
  const rating = Math.round((3.5 + rng() * 1.4) * 10) / 10; // 3.5..4.9
  const popularity = Math.round(rng() * 100);
  const fsq_id = `fsq_demo_${toSlug(name)}_${i}`;

  return {
    fsq_id,
    name,
    url: fakeUrl(name),
    address: fakeAddress(rng),
    reviewCount,
    rating,
    popularity,
    source: "foursquare", // mantemos por compat; seu front já espera isso
  };
}

/* ------------------------- Parser de texto livre --------------------------- */
function parseSearchText(text: string): { query: string; location: string } {
  const input = String(text || "").trim();
  const patterns = [/^(.+?)\s+(?:em|no|na)\s+(.+)$/i, /^(.+?)\s*,\s*(.+)$/];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return { query: m[1].trim(), location: m[2].trim() };
  }
  return { query: input, location: "" };
}

/* ----------------------- Geradores (mesmas assinaturas) -------------------- */

function generatePlaces(seed: string, topic: string, limit = 15): Place[] {
  const rng = makeRng(seed);
  const n = clamp(limit, 5, 25);
  const out: Place[] = [];
  for (let i = 0; i < n; i++) out.push(fakePlace(rng, topic || "Negócio", i));
  // “de-duplicar” nomes iguais por acaso
  const seen = new Set<string>();
  return out.filter((p) =>
    seen.has(p.name) ? false : (seen.add(p.name), true)
  );
}

export async function searchPlacesFoursquare(
  queryOrText: string,
  near?: string,
  opts?: SearchOpts
): Promise<Place[]> {
  const { query, location } = near
    ? { query: queryOrText, location: near }
    : parseSearchText(queryOrText);

  const seed = `search|${query}|${location}|${opts?.radiusMeters}|${opts?.categories}|${opts?.limit}`;
  return generatePlaces(seed, query, opts?.limit ?? 15);
}

export async function searchPlacesFoursquareByLL(
  query: string,
  lat: number,
  lng: number,
  opts?: SearchOpts
): Promise<Place[]> {
  const seed = `byLL|${query}|${lat.toFixed(3)},${lng.toFixed(3)}|${
    opts?.radiusMeters
  }|${opts?.categories}|${opts?.limit}`;
  return generatePlaces(seed, query, opts?.limit ?? 15);
}

export async function findNearbyPlacesGeotagging(
  lat: number,
  lng: number,
  opts?: Pick<SearchOpts, "limit" | "radiusMeters">
): Promise<Place[]> {
  const seed = `nearby|${lat.toFixed(3)},${lng.toFixed(3)}|${
    opts?.radiusMeters
  }|${opts?.limit}`;
  // topic genérico “Pontos de Interesse”
  return generatePlaces(seed, "Ponto de Interesse", opts?.limit ?? 15);
}

export async function findSimilarPlaces(
  fsqId: string,
  opts?: Pick<SearchOpts, "limit" | "radiusMeters">
): Promise<Place[]> {
  // usa o id como seed; topic a partir do id para “variações”
  const topic = fsqId.replace(/^fsq_demo_|_/g, " ").trim() || "Negócio";
  const seed = `similar|${fsqId}|${opts?.radiusMeters}|${opts?.limit}`;
  return generatePlaces(seed, topic, opts?.limit ?? 12);
}

/* --------------------------- Evidências p/ front --------------------------- */
export function buildCompetitorEvidence(places: Place[]) {
  const max = Math.max(...places.map((p) => p.reviewCount ?? 0), 1);
  return places.map((p) => ({
    name: p.name,
    url: p.url,
    address: p.address,
    reviewCount: p.reviewCount ?? 0,
    visibilityIndex: Math.round(((p.reviewCount ?? 0) / max) * 100),
    source: p.source,
  }));
}

export function buildVisibilityChartData(places: Place[]) {
  const evidence = buildCompetitorEvidence(places);
  return evidence
    .filter((e) => e.visibilityIndex > 0)
    .sort((a, b) => b.visibilityIndex - a.visibilityIndex)
    .slice(0, 10)
    .map((e) => ({
      name: e.name.length > 20 ? e.name.substring(0, 17) + "..." : e.name,
      value: e.visibilityIndex,
      fullName: e.name,
      address: e.address,
      reviewCount: e.reviewCount,
      url: e.url,
    }));
}
