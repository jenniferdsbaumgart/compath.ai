"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "recharts";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface AnalyticsData {
  summary: {
    userMetrics: any;
    reportMetrics: any;
    revenueMetrics: any;
    notificationMetrics: any;
  };
  realtime: {
    activeUsers: number;
    reportsGeneratedLastHour: number;
    revenueLastHour: number;
  };
  charts: {
    userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
    revenueTrend: Array<{ date: string; revenue: number }>;
    reportGeneration: Array<{ date: string; reports: number }>;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await fetchAnalytics();
    };

    checkAccess();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const [summaryResponse, realtimeResponse] = await Promise.all([
        api.get(`/analytics/summary?period=${timeRange}`),
        api.get("/analytics/realtime"),
      ]);

      const summaryData = summaryResponse.data;
      const realtimeData = realtimeResponse.data;

      // Generate mock chart data for now
      const mockCharts = generateMockChartData(timeRange);

      setData({
        summary: summaryData,
        realtime: realtimeData,
        charts: mockCharts,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Set mock data if API fails
      setData({
        summary: {
          userMetrics: {
            totalUsers: 1250,
            activeUsers: 890,
            newUsersToday: 12,
            userRetentionRate: 0.75,
          },
          reportMetrics: {
            totalReports: 5432,
            reportsGeneratedToday: 45,
            averageCompletionTime: 180,
          },
          revenueMetrics: {
            totalRevenue: 12500,
            revenueToday: 450,
            averageRevenuePerUser: 10,
          },
          notificationMetrics: {
            totalSent: 8900,
            deliveryRate: 0.95,
            openRate: 0.6,
          },
        },
        realtime: {
          activeUsers: 23,
          reportsGeneratedLastHour: 5,
          revenueLastHour: 45.5,
        },
        charts: generateMockChartData(timeRange),
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockChartData = (range: string) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const userGrowth = [];
    const revenueTrend = [];
    const reportGeneration = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      userGrowth.push({
        date: date.toISOString().split("T")[0],
        newUsers: Math.floor(Math.random() * 20) + 5,
        totalUsers: 1000 + (days - i) * 10 + Math.floor(Math.random() * 50),
      });

      revenueTrend.push({
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 200) + 100,
      });

      reportGeneration.push({
        date: date.toISOString().split("T")[0],
        reports: Math.floor(Math.random() * 30) + 10,
      });
    }

    return { userGrowth, revenueTrend, reportGeneration };
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const exportData = () => {
    // TODO: Implement data export
    console.log("Exporting analytics data...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load analytics
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the analytics data.
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { summary, realtime, charts } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                System Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Detailed metrics and insights for the platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">Back to Admin</Button>
              </Link>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users (Now)
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reports (Last Hour)
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realtime.reportsGeneratedLastHour}
              </div>
              <p className="text-xs text-muted-foreground">
                Generated in last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue (Last Hour)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${realtime.revenueLastHour.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Earned in last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>Daily report generation volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.reportGeneration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Bar dataKey="reports" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Key metrics overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Users</span>
                  <Badge variant="secondary">
                    {summary.userMetrics?.totalUsers || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Reports</span>
                  <Badge variant="secondary">
                    {summary.reportMetrics?.totalReports || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <Badge variant="secondary">
                    ${summary.revenueMetrics?.totalRevenue || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Retention</span>
                  <Badge variant="secondary">
                    {Math.round(
                      (summary.userMetrics?.userRetentionRate || 0) * 100
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
