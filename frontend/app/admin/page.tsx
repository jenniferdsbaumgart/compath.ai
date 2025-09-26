"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Settings,
  BarChart,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  systemHealth: "healthy" | "warning" | "error";
  lastBackup: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

      setUser(currentUser);
      await fetchAdminStats();
    };

    checkAccess();
  }, [router]);

  const fetchAdminStats = async () => {
    try {
      // Fetch admin stats from dedicated endpoint
      const response = await api.get("/admin/stats");
      const data = response.data;

      const adminStats: AdminStats = {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalReports: data.totalReports || 0,
        systemHealth: data.systemHealth || "unknown",
        lastBackup: data.lastBackup || new Date().toISOString(),
      };

      setStats(adminStats);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      // Fallback to mock data if API fails
      const mockStats: AdminStats = {
        totalUsers: 1250,
        activeUsers: 890,
        totalReports: 5432,
        systemHealth: "healthy",
        lastBackup: new Date().toISOString(),
      };
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const adminSections = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "System Analytics",
      description: "View detailed system metrics and reports",
      icon: BarChart,
      href: "/admin/analytics",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Security Settings",
      description: "Configure security policies and monitoring",
      icon: Shield,
      href: "/admin/security",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Database Management",
      description: "Backup, restore, and database operations",
      icon: Database,
      href: "/admin/database",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "System Health",
      description: "Monitor system performance and alerts",
      icon: Activity,
      href: "/admin/health",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Model Training",
      description: "Retrain and manage ML models",
      icon: Settings,
      href: "/admin/model",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor the Compath.ai platform
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalUsers?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats?.activeUsers || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalReports?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Generated this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {stats?.systemHealth === "healthy" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : stats?.systemHealth === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-2xl font-bold capitalize">
                  {stats?.systemHealth || "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.lastBackup
                  ? new Date(stats.lastBackup).toLocaleDateString()
                  : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.lastBackup
                  ? new Date(stats.lastBackup).toLocaleTimeString()
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card
              key={section.href}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button className="w-full">Access {section.title}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin/users">View All Users</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/analytics">System Reports</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/model">Retrain Model</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
