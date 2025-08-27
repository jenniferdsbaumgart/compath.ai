/** Tipos básicos */
export type Place = {
  fsq_id: string;
  name: string;
  url?: string;
  address?: string;
  reviewCount?: number;
  rating?: number;
  popularity?: number;
  source: "foursquare";
};

type SearchOpts = {
  limit?: number;
  categories?: string | number | Array<string | number>;
};

/** Normaliza lista removendo duplicados simples por (name+address) */
function dedupePlaces(list: Place[]): Place[] {
  const seen = new Set<string>();
  return list.filter(p => {
    const key = `${p.name}::${p.address ?? ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Constrói query param de categorias */
function categoriesParam(categories?: SearchOpts["categories"]) {
  if (!categories) return undefined;
  const arr = Array.isArray(categories) ? categories : [categories];
  return arr.join(",");
}

/** Busca por texto “near=Blumenau, BR” */
export async function searchPlacesFoursquare(
  query: string,
  near: string,
  { limit = 10, categories }: SearchOpts = {}
): Promise<Place[]> {
  const key = process.env.FSQ_API_KEY;
  if (!key) throw new Error("FSQ_API_KEY ausente");

  const url = new URL("https://api.foursquare.com/v3/places/search");
  url.searchParams.set("query", query);
  url.searchParams.set("near", near);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "RELEVANCE");
  // pedir campos explicitamente ajuda a garantir presença no payload
  url.searchParams.set("fields", [
    "fsq_id",
    "name",
    "website",
    "location",
    "rating",
    "popularity",
    "stats"
  ].join(","));
  const cats = categoriesParam(categories);
  if (cats) url.searchParams.set("categories", cats);

  const res = await fetch(url.toString(), {
    headers: { Authorization: key, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Foursquare ${res.status}: ${await res.text()}`);

  const data: any = await res.json();
  const results: any[] = data.results || [];

  const places = results.map((p) => ({
    fsq_id: p.fsq_id,
    name: p.name,
    url: p.website || undefined,
    address: p.location?.formatted_address,
    reviewCount: p.stats?.total_ratings ?? 0,
    rating: p.rating ?? undefined,
    popularity: p.popularity ?? undefined,
    source: "foursquare" as const,
  })) as Place[];

  return dedupePlaces(places);
}

/** Busca por coordenadas (lat,lng) — mais confiável que “near” em alguns casos */
export async function searchPlacesFoursquareByLL(
  query: string,
  lat: number,
  lng: number,
  { limit = 10, categories }: SearchOpts = {}
): Promise<Place[]> {
  const key = process.env.FSQ_API_KEY;
  if (!key) throw new Error("FSQ_API_KEY ausente");

  const url = new URL("https://api.foursquare.com/v3/places/search");
  url.searchParams.set("query", query);
  url.searchParams.set("ll", `${lat},${lng}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "RELEVANCE");
  url.searchParams.set("fields", [
    "fsq_id",
    "name",
    "website",
    "location",
    "rating",
    "popularity",
    "stats"
  ].join(","));
  const cats = categoriesParam(categories);
  if (cats) url.searchParams.set("categories", cats);

  const res = await fetch(url.toString(), {
    headers: { Authorization: key, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Foursquare ${res.status}: ${await res.text()}`);

  const data: any = await res.json();
  const results: any[] = data.results || [];

  const places = results.map((p) => ({
    fsq_id: p.fsq_id,
    name: p.name,
    url: p.website || undefined,
    address: p.location?.formatted_address,
    reviewCount: p.stats?.total_ratings ?? 0,
    rating: p.rating ?? undefined,
    popularity: p.popularity ?? undefined,
    source: "foursquare" as const,
  })) as Place[];

  return dedupePlaces(places);
}

/** Constrói “evidence” / keyPlayers com índice de visibilidade 0–100 (derivado de reviews) */
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

/** Útil no controller: transforma evidence -> keyPlayers (mesmo shape) */
export function buildKeyPlayersFromPlaces(places: Place[]) {
  const max = Math.max(...places.map((p) => p.reviewCount ?? 0), 1);
  return places.map((p) => ({
    name: p.name,
    url: p.url,
    address: p.address,
    visibilityIndex: Math.round(((p.reviewCount ?? 0) / max) * 100),
  }));
}
