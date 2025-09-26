export function normalizeIncomingReport(raw: any) {
  const r = { ...(raw || {}) };

  if (raw?.title) {
    r.title = String(raw.title).trim();
  }

  // targetAudience pode vir string → transforma em array
  if (typeof r.targetAudience === "string") {
    r.targetAudience = r.targetAudience
      .split(/,| e /i)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (!Array.isArray(r.targetAudience)) r.targetAudience = [];

  // customerSegments pode vir ausente, com "value" ao invés de "percentage", etc.
  if (Array.isArray(r.customerSegments)) {
    r.customerSegments = r.customerSegments
      .map((s: any) => ({
        name: String(s?.name ?? "").trim(),
        percentage: Number(s?.percentage ?? s?.value ?? 0),
      }))
      .filter((s: any) => s.name && Number.isFinite(s.percentage));
  } else {
    r.customerSegments = [];
  }

  // listas obrigatórias com default (evita required + undefined no mongoose)
  const listKeys = [
    "keyPlayers",
    "opportunities",
    "challenges",
    "recommendations",
    "strengths",
    "weaknesses",
  ];
  for (const k of listKeys) {
    if (!Array.isArray(r[k])) r[k] = [];
  }

  // keyPlayers: garantir shape mínimo
  r.keyPlayers = r.keyPlayers
    .map((kp: any) => ({
      name: String(kp?.name ?? "").trim(),
      marketShare: String(kp?.marketShare ?? "").trim(),
    }))
    .filter((kp: any) => kp.name);

  return r;
}
