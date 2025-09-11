
export type KeyPlayer = {
  name?: string;
  marketShare?: string | number;
  market_share?: number;
  visibilityIndex?: number; // ← preservar
};
export type CustomerSegment = { name?: string; percentage?: number; value?: number };

export function parsePercent(val: string | number | undefined) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  const n = Number(String(val).replace(/[^\d.,-]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function clampText(s: string, max = 160) {
  if (!s) return s;
  return s.length > max ? s.slice(0, max).trim() + "…" : s;
}

function dedupeStrings(list: string[]) {
  const seen = new Set<string>();
  return list.filter((x) => {
    const k = x.toLowerCase().trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function normalizeAudience(aud: unknown): string[] {
  if (Array.isArray(aud)) return dedupeStrings(aud.map(String).map((s) => s.trim())).slice(0, 6);
  if (typeof aud === "string") {
    const parts = aud.split(/,| e /i).map((s) => s.trim()).filter(Boolean);
    return dedupeStrings(parts).slice(0, 6);
  }
  return [];
}

export function normalizeKeyPlayers(players: KeyPlayer[] = []) {
  const parsed = players.map((p) => {
    const ms =
      typeof p.market_share === "number" ? p.market_share : parsePercent(p.marketShare);
    const vi =
      Number.isFinite(Number((p as any).visibilityIndex))
        ? Number((p as any).visibilityIndex)
        : undefined;
    return {
      name: p.name?.trim() || "—",
      market_share: ms,
      visibilityIndex: vi, // ← NÃO perder
    };
  });
  const total = parsed.reduce((acc, p) => acc + p.market_share, 0);
  if (total > 0 && Math.round(total) !== 100) {
    return parsed.map((p) => ({
      ...p,
      market_share: +((p.market_share * 100) / total).toFixed(2),
    }));
  }
  return parsed;
}

function normalizeCustomerSegments(segments: CustomerSegment[] | undefined, audience: string[]) {
  if (Array.isArray(segments) && segments.length) {
    const parsed = segments.map((s) => ({
      name: (s.name ?? "Segmento").toString().trim(),
      value: Number(s.percentage ?? s.value ?? 0),
    }));
    // normaliza para somar 100 (se necessário)
    const total = parsed.reduce((a, b) => a + (isFinite(b.value) ? b.value : 0), 0);
    if (total > 0 && Math.round(total) !== 100) {
      return parsed.map((s) => ({ ...s, value: +(s.value * 100 / total).toFixed(2) }));
    }
    return parsed;
  }
  // fallback 100/n a partir do público-alvo
  const n = audience.length || 1;
  return audience.slice(0, 6).map((name) => ({ name, value: Math.floor(100 / n) }));
}

export function normalizeReport(raw: any) {
  const title =
    (raw?.title && String(raw.title).trim()) ||
    (raw?.topic && String(raw.topic).trim()) ||
    "Relatório sem título";

  const audience = normalizeAudience(raw?.targetAudience);
  const keyPlayers = normalizeKeyPlayers(raw?.keyPlayers);
  const customerSegments = normalizeCustomerSegments(raw?.customerSegments, audience);

  return {
    ...raw,
    title,
    marketSize: raw?.marketSize || "—",
    growthRate: clampText(raw?.growthRate ?? "", 80),
    competitionLevel: clampText(raw?.competitionLevel ?? "", 40),
    entryBarriers: clampText(raw?.entryBarriers ?? "", 160),
    recommendations: (raw?.recommendations ?? []).map((r: string) => clampText(r, 120)).slice(0, 6),
    strengths: (raw?.strengths ?? []).map((s: string) => clampText(s, 120)).slice(0, 6),
    weaknesses: (raw?.weaknesses ?? []).map((w: string) => clampText(w, 120)).slice(0, 6),
    opportunities: (raw?.opportunities ?? []).map((o: string) => clampText(o, 120)).slice(0, 6),
    challenges: (raw?.challenges ?? []).map((c: string) => clampText(c, 120)).slice(0, 6),
    keyPlayers,
    targetAudience: audience,
    customerSegments,
  };
}
