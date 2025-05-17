"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Building,
  ShoppingBag,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  Download,
  TrendingDown,
  BanknoteArrowUp,
  Star,
} from "lucide-react";

import { Footer } from "@/components/layout/footer";
import FavoriteSearch from "@/components/ui/favorite-search";

// Mock data for charts
const monthlyRevenueData = [
  { month: "Jan", revenue: 15000 },
  { month: "Fev", revenue: 18000 },
  { month: "Mar", revenue: 22000 },
  { month: "Abr", revenue: 25000 },
  { month: "Mai", revenue: 30000 },
  { month: "Jun", revenue: 35000 },
];

const competitorData = [
  { name: "Barbearia A", market_share: 30 },
  { name: "Barbearia B", market_share: 25 },
  { name: "Barbearia C", market_share: 20 },
  { name: "Outros", market_share: 25 },
];

const customerSegmentData = [
  { name: "Famílias", value: 40 },
  { name: "Jovens", value: 30 },
  { name: "Turistas", value: 20 },
  { name: "Outros", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ResultadosPesquisaPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>Pesquisa de Mercado</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Beleza</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">
              Barbearia em Garcia, Blumenau - SC
            </span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex">
                <h1 className="text-3xl font-bold">
                  Análise de Mercado: Barbearia
                </h1>
                <FavoriteSearch />
              </div>
              <p className="text-muted-foreground mt-2">
                Região: Garcia, Blumenau - SC
              </p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Potencial de Mercado
                  </p>
                  <p className="text-2xl font-bold">R$ 2400/mês</p>
                </div>
                <div className="p-2 mt-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <div className="items-center mt-3">
                <Progress value={12} className="mt-5" />
                <p className="text-sm text-muted-foreground mt-2">
                  Potencial baixo de crescimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Demanda
                  </p>

                  <p className="text-4xl font-bold">-3.49%</p>
                </div>
                <div className="p-2 mt-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-300" />
                </div>
              </div>

              <div className="flex items-center mt-5">
                <Badge variant="destructive" className="mr-2">
                  Saturado
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Baixa demanda
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Investimento Inicial
                  </p>
                  <p className="text-xl font-bold">R$ 500,00 e 3.000,00</p>
                </div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <BanknoteArrowUp className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Equipamentos</span>
                  <span>R$ 80-100k</span>
                </div>
                {/* <div className="flex items-center justify-between text-sm">
                  <span>Reforma</span>
                  <span>R$ 50-70k</span>
                </div> */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Capital de Giro</span>
                  <span>R$ 50-80k</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Retorno Estimado
                  </p>
                  <p className="text-2xl font-bold">18-24 meses</p>
                </div>
                <div className="p-2 mt-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Projeção</span>
                  <span className="font-medium text-green-600">25-30%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal Projetada</CardTitle>
              <CardDescription>
                Projeção de faturamento para os primeiros 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name="Receita (R$)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise da Concorrência</CardTitle>
              <CardDescription>
                Market share dos principais concorrentes na região
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={competitorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="market_share"
                    >
                      {competitorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segments and Location Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Segmentação de Clientes</CardTitle>
              <CardDescription>
                Distribuição dos principais grupos de consumidores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerSegmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#657FEE"
                      name="Porcentagem (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise da Localização</CardTitle>
              <CardDescription>
                Características do ponto comercial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Localização</p>
                    <p className="text-sm text-muted-foreground">
                      Rua Amazonas, próximo ao colégio Santos Dumont
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fluxo de Pessoas</p>
                    <p className="text-sm text-muted-foreground">
                      Alto (média de 5.000 pessoas/dia)
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tipo de Imóvel</p>
                    <p className="text-sm text-muted-foreground">
                      Loja térrea com 80m²
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Comércio Local</p>
                    <p className="text-sm text-muted-foreground">
                      Região com restaurantes e lojas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SWOT Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col items-right">
                <div className="flex">
                  <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                  Pontos Fortes e Oportunidades
                </div>

                <p className="text-sm font-semilightt text-muted-foreground">
                  Gerado por IA
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Forças</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Localização privilegiada com alto fluxo de pessoas</li>
                    <li>Região com público fiel e recorrente</li>
                    <li>Proximidade com escolas e empresas</li>
                    <li>Ambiente moderno e diferenciado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Oportunidades</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      Crescimento da demanda por serviços de estética masculina
                    </li>
                    <li>
                      Possibilidade de oferecer serviços diferenciados (barba,
                      cabelo, estética)
                    </li>
                    <li>
                      Parcerias com empresas locais para benefícios corporativos
                    </li>
                    <li>
                      Eventos temáticos e promoções para fidelização de clientes
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col items-right">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Pontos Fracos e Ameaças
                </div>

                <p className="text-sm font-semilightt text-muted-foreground">
                  Gerado por IA
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Fraquezas</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Alto custo inicial para montagem da barbearia</li>
                    <li>Necessidade de reformas para adequação do espaço</li>
                    <li>Dependência de profissionais qualificados</li>
                    <li>
                      Dificuldade em criar diferenciação frente a outras
                      barbearias
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ameaças</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      Concorrência de barbearias já consolidadas na região
                    </li>
                    <li>Flutuação no preço de produtos e insumos de beleza</li>
                    <li>Mudanças nas tendências de moda masculina</li>
                    <li>Entrada de novas barbearias ou franquias no bairro</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
