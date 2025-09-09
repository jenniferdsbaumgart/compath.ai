"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FavoriteSearch from "@/components/ui/favorite-search";

import {
  ChevronRight,
  Download,
  DollarSign,
  Minus,
  TrendingDown,
  TrendingUp,
  BanknoteArrowUp,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAiReportById } from "@/lib/api";
import { normalizeReport } from "@/lib/normalizeReport";
import CompetitorsMap from "@/components/maps/CompetitorsMap";

/* ------------ helpers ------------ */

type CompetitionStyle = {
  label: string;
  badgeVariant: "destructive" | "secondary" | "outline";
  colorClass: string;
  icon: any;
};
function getCompetitionStyle(level?: string): CompetitionStyle {
  const v = (level || "").toLowerCase();
  if (v.includes("baixo")) {
    return {
      label: "Baixa concorrência",
      badgeVariant: "secondary",
      colorClass: "text-green-600 bg-green-100 dark:bg-green-900",
      icon: TrendingDown,
    };
  }
  if (v.includes("méd") || v.includes("medio") || v.includes("médio")) {
    return {
      label: "Concorrência moderada",
      badgeVariant: "outline",
      colorClass: "text-amber-600 bg-amber-100 dark:bg-amber-900",
      icon: Minus,
    };
  }
  if (v.includes("alto") || v.includes("alta")) {
    return {
      label: "Concorrência alta",
      badgeVariant: "destructive",
      colorClass: "text-red-600 bg-red-100 dark:bg-red-900",
      icon: TrendingUp,
    };
  }
  return {
    label: "Concorrência indefinida",
    badgeVariant: "outline",
    colorClass: "text-muted-foreground bg-muted",
    icon: Minus,
  };
}

function pickTitle(r: any): string {
  const t = (r?.title || "").trim();
  if (t && t.toLowerCase() !== "relatório sem título") return t;
  const fb =
    r?.topic || r?.niche || r?.searchQuery || r?.query || r?.location || "";
  return String(fb || "").trim();
}

const CATEGORY_ALIASES: Record<string, string> = {
  "produtos naturais": "Lojas de Produtos Naturais",
  "loja de produtos naturais": "Lojas de Produtos Naturais",
  natural: "Lojas de Produtos Naturais",
  barbearia: "Barbearias",
  mercearia: "Mercearias",
  pilates: "Estúdios de Pilates",
  papelaria: "Papelarias",
  "salão de beleza": "Salões de Beleza",
  "salao de beleza": "Salões de Beleza",
  padaria: "Padarias",
  "distribuidora de bebidas": "Distribuidoras de Bebidas",
  "agência de viagens": "Agências de Viagens",
  "agencia de viagens": "Agências de Viagens",
  lanchonete: "Lanchonetes",
  brechó: "Brechós",
  brecho: "Brechós",
};
function inferMapCategories(...txt: (string | undefined)[]) {
  const hay = txt.filter(Boolean).join(" ").toLowerCase();
  const out = new Set<string>();
  for (const [kw, cat] of Object.entries(CATEGORY_ALIASES)) {
    if (hay.includes(kw)) out.add(cat);
  }
  return Array.from(out);
}

type VisDatum = { name: string; value: number };

/* ------------ page ------------ */

export default function ResultadosPesquisaPage() {
  const [report, setReport] = useState<any>(null);

  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  const urlQuery =
    searchParams.get("q") ||
    searchParams.get("query") ||
    searchParams.get("niche") ||
    "";

  // carrega e normaliza
  useEffect(() => {
    if (!reportId) return;
    (async () => {
      const res = await getAiReportById(reportId);
      const raw = res?.report?.report ?? res?.report ?? res;
      setReport(normalizeReport(raw));
    })().catch(console.error);
  }, [reportId]);

  // hooks SEMPRE antes de qualquer return condicional
  const heading = useMemo(() => pickTitle(report ?? {}), [report]);

  const competition = useMemo(
    () => getCompetitionStyle(report?.competitionLevel ?? ""),
    [report?.competitionLevel]
  );

  const focusCats = useMemo(
    () => inferMapCategories(heading, urlQuery),
    [heading, urlQuery]
  );

  const audience: string[] = useMemo(() => {
    return Array.isArray(report?.targetAudience)
      ? (report!.targetAudience as string[])
      : String(report?.targetAudience ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }, [report?.targetAudience]);

  type KeyPlayer = { name?: string; visibilityIndex?: number };
  type VisDatum = { name: string; value: number };

  const visibilityData = useMemo<VisDatum[]>(() => {
    const list: KeyPlayer[] = Array.isArray(report?.keyPlayers)
      ? (report!.keyPlayers as KeyPlayer[])
      : [];

    return list
      .map(
        (k): VisDatum => ({
          name: String(k?.name ?? ""),
          value: Number(k?.visibilityIndex ?? 0),
        })
      )
      .filter((d: VisDatum) => d.name.length > 0 && Number.isFinite(d.value));
    // alternativa com type predicate:
    // .filter((d): d is VisDatum => d.name.length > 0 && Number.isFinite(d.value));
  }, [report?.keyPlayers]);

  const hasCompetitorData = visibilityData.length > 0;

  if (!report) {
    return <p className="text-center mt-12">Carregando dados...</p>;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>Pesquisa de Mercado</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">Relatório Inteligente</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-start gap-2">
                <h1 className="text-3xl font-bold">
                  Análise de Mercado{heading ? `: ${heading}` : ""}
                </h1>
                <FavoriteSearch />
              </div>
              {report.marketSize && (
                <p className="text-sm text-muted-foreground mt-2">
                  Tamanho de mercado (estimativa): {report.marketSize}
                </p>
              )}
            </div>

            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tamanho de Mercado
                  </p>
                  <p className="text-2xl font-bold">
                    {report.marketSize || "—"}
                  </p>
                </div>
                <div className="p-2 mt-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <div className="items-center mt-3">
                <Progress value={20} className="mt-5" />
                <p className="text-sm text-muted-foreground">
                  {report.growthRate}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Concorrência
                  </p>
                  <p className="text-2xl font-bold">
                    {report.competitionLevel || "—"}
                  </p>
                </div>
                <div
                  className={`p-2 mt-2 rounded-full ${competition.colorClass}`}
                >
                  <competition.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex flex-col items-start mt-5 gap-3">
                <Badge
                  variant={competition.badgeVariant}
                  className="whitespace-normal leading-tight text-xs px-2 py-0.5 max-w-[9rem]"
                >
                  {competition.label}
                </Badge>
                <span
                  className="text-sm text-muted-foreground flex-1 break-words"
                  title={report.entryBarriers}
                >
                  {report.entryBarriers}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground">
                    Público-Alvo
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audience.slice(0, 8).map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-foreground"
                        title={a}
                      >
                        {a}
                      </span>
                    ))}
                    {audience.length === 0 && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <BanknoteArrowUp className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recomendações
                  </p>
                  <p className="text-2xl font-bold">3 principais</p>
                </div>
                <div className="p-2 mt-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {(report.recommendations || [])
                  .slice(0, 3)
                  .map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                {(!report.recommendations ||
                  report.recommendations.length === 0) && <li>—</li>}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* gráficos / mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Concorrentes verificados</CardTitle>
              <CardDescription>
                Índice de visibilidade (0–100) baseado em avaliações públicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCompetitorData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={visibilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Bar dataKey="value" name="Visibilidade (%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Sem dados verificados de concorrentes para exibir.
                  </p>
                  {Array.isArray(report.sources) &&
                    report.sources.length > 0 && (
                      <>
                        <p className="mb-1">Fontes consultadas:</p>
                        <ul className="list-disc list-inside">
                          {report.sources
                            .slice(0, 8)
                            .map((s: any, i: number) => (
                              <li key={i}>
                                {s.url ? (
                                  <a
                                    href={s.url}
                                    className="underline inline-flex items-center gap-1"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <LinkIcon className="h-3 w-3" /> {s.name}
                                  </a>
                                ) : (
                                  s.name
                                )}
                              </li>
                            ))}
                        </ul>
                      </>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mapa de Concorrentes</CardTitle>
              <CardDescription>
                Blumenau — camadas por categoria e zonas sugeridas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorsMap
                center={[-26.915, -49.07]}
                zoom={14}
                jsonUrl="/data/pontos.json"
                focusCategories={focusCats}
                autoFit
                className="h-[420px] w-full rounded-md overflow-hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Fonte: OpenStreetMap · Dados locais (MVP).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SWOT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                Pontos Fortes e Oportunidades
              </CardTitle>
              <CardDescription>Baseado no relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Forças</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                {(report.strengths || []).map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <h4 className="font-medium mb-2">Oportunidades</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {(report.opportunities || []).map((o: string, i: number) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Fraquezas e Desafios
              </CardTitle>
              <CardDescription>Baseado no relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Fraquezas</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                {(report.weaknesses || []).map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <h4 className="font-medium mb-2">Desafios</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {(report.challenges || []).map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
