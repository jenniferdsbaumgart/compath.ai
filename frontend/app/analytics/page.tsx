'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  FileText,
  DollarSign,
  Bell,
  TrendingUp,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  totalRevenue: number;
  userGrowth: number;
  reportGrowth: number;
  revenueGrowth: number;
}

interface RealTimeMetrics {
  activeUsers: number;
  reportsGeneratedToday: number;
  revenueToday: number;
  notificationsSentToday: number;
}

interface ChartData {
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  reportGeneration: Array<{ date: string; reports: number }>;
}

interface DashboardAnalytics {
  summary: AnalyticsSummary;
  realtime: RealTimeMetrics;
  charts: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAnalyticsDashboard();
      setData(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Erro ao carregar analytics',
        description: 'Não foi possível carregar os dados analíticos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Erro ao carregar dados
            </h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados analíticos.
            </p>
            <Button onClick={fetchAnalytics}>Tentar novamente</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { summary, realtime, charts } = data;

  // Prepare data for pie chart
  const userActivityData = [
    { name: 'Usuários Ativos', value: summary.activeUsers, color: COLORS[0] },
    { name: 'Usuários Inativos', value: summary.totalUsers - summary.activeUsers, color: COLORS[1] },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Métricas e insights sobre o desempenho da plataforma
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(realtime.activeUsers)}</div>
              <p className="text-xs text-muted-foreground">
                Online agora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios Hoje</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(realtime.reportsGeneratedToday)}</div>
              <p className="text-xs text-muted-foreground">
                Gerados hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(realtime.revenueToday)}</div>
              <p className="text-xs text-muted-foreground">
                Arrecadado hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(realtime.notificationsSentToday)}</div>
              <p className="text-xs text-muted-foreground">
                Enviadas hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{formatNumber(summary.totalUsers)}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">{formatPercentage(summary.userGrowth)}</span>
                <span className="text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{formatNumber(summary.totalReports)}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">{formatPercentage(summary.reportGrowth)}</span>
                <span className="text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{formatCurrency(summary.totalRevenue)}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">{formatPercentage(summary.revenueGrowth)}</span>
                <span className="text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>
                Novos usuários e total acumulado nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number, name: string) => [
                      formatNumber(value),
                      name === 'newUsers' ? 'Novos usuários' : 'Total de usuários'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade dos Usuários</CardTitle>
              <CardDescription>
                Distribuição entre usuários ativos e inativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userActivityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Receita</CardTitle>
              <CardDescription>
                Receita diária nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7300"
                    strokeWidth={3}
                    dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Report Generation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Geração de Relatórios</CardTitle>
              <CardDescription>
                Número de relatórios gerados por dia nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.reportGeneration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number) => [formatNumber(value), 'Relatórios']}
                  />
                  <Bar dataKey="reports" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Ativação</CardTitle>
              <CardDescription>
                Porcentagem de usuários que realizaram ações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {summary.totalUsers > 0
                  ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Baseado em atividade nos últimos 30 dias
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita por Usuário</CardTitle>
              <CardDescription>
                Receita média gerada por usuário ativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {summary.activeUsers > 0
                  ? formatCurrency(summary.totalRevenue / summary.activeUsers)
                  : formatCurrency(0)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                ARPU (Average Revenue Per User)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
