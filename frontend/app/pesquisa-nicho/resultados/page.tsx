"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, ChevronRight, DollarSign, TrendingDown, BanknoteArrowUp, Clock, MapPin, Users, Building, ShoppingBag, ThumbsUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import FavoriteSearch from "@/components/ui/favorite-search";
import { getAiReportById } from "@/lib/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ResultadosPesquisaPage() {
  const [researchResults, setResearchResults] = useState<any>(null);
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  useEffect(() => {
    if (!reportId) return;
  
    const fetchReport = async () => {
      try {
        const reportData = await getAiReportById(reportId);
        setResearchResults(reportData.report);
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
        toast.error("Não foi possível carregar o relatório.");
      }
    };
  
    fetchReport();
  }, [reportId]);

  if (!researchResults) return <p className="text-center mt-12">Carregando dados...</p>;

  const keyPlayers = researchResults.keyPlayers.map((p: any) => ({
    name: p.name,
    market_share: Number(p.marketShare.replace("%", "")),
  }));

  const audience = Array.isArray(researchResults.targetAudience)
    ? researchResults.targetAudience
    : researchResults.targetAudience?.split(",") || [];

  const customerSegmentData = audience.map((name: string) => ({
    name: name.trim(),
    value: Math.floor(100 / audience.length),
  }));


  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>Pesquisa de Mercado</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">Relatório Inteligente</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex">
                <h1 className="text-3xl font-bold">Análise de Mercado: {researchResults.title}</h1>
                <FavoriteSearch />
              </div>
              <p className="text-muted-foreground mt-2">{researchResults.marketSize}</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamanho de Mercado</p>
                  <p className="text-2xl font-bold">{researchResults.marketSize}</p>
                </div>
                <div className="p-2 mt-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <div className="items-center mt-3">
                <Progress value={20} className="mt-5" />
                <p className="text-sm text-muted-foreground">{researchResults.growthRate}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concorrência</p>
                  <p className="text-2xl font-bold">{researchResults.competitionLevel}</p>
                </div>
                <div className="p-2 mt-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-300" />
                </div>
              </div>
              <div className="flex items-center mt-5">
                <Badge variant="destructive" className="mr-2">
                  Saturado
                </Badge>
                <span className="text-sm text-muted-foreground">{researchResults.entryBarriers}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Público-Alvo</p>
                  <p className="text-xl font-bold">{audience.join(", ")}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Recomendações</p>
                  <p className="text-2xl font-bold">3 principais</p>
                </div>
                <div className="p-2 mt-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {researchResults.recommendations.slice(0, 3).map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Participação de Mercado</CardTitle>
              <CardDescription>Principais concorrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={keyPlayers}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="market_share"
                  >
                    {keyPlayers.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segmentação de Clientes</CardTitle>
              <CardDescription>Distribuição estimada</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerSegmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#657FEE" name="Porcentagem (%)" />
                </BarChart>
              </ResponsiveContainer>
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
              <CardDescription>Gerado por IA</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Forças</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                {researchResults.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
              <h4 className="font-medium mb-2">Oportunidades</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {researchResults.opportunities.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Fraquezas e Ameaças
              </CardTitle>
              <CardDescription>Gerado por IA</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Fraquezas</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                {researchResults.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
              <h4 className="font-medium mb-2">Desafios</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {researchResults.challenges.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}