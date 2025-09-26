"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  Square,
  BarChart,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Edit,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ABTest {
  _id: string;
  name: string;
  description: string;
  type: string;
  goal: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  variants: { [key: string]: any };
  schedule: {
    startDate: Date;
    endDate?: Date;
    minSampleSize?: number;
  };
  results?: {
    totalParticipants: number;
    variantResults: { [key: string]: any };
  };
  createdAt: string;
  createdBy: string;
}

export default function ABTestingPage() {
  const router = useRouter();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    completedTests: 0,
    totalParticipants: 0,
  });

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

      await fetchTests();
    };

    checkAccess();
  }, [router]);

  const fetchTests = async () => {
    try {
      const response = await api.get("/ab-testing/tests");
      const data = response.data;

      if (data.success) {
        setTests(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch A/B tests:", error);
      // Set mock data for development
      const mockTests: ABTest[] = [
        {
          _id: "1",
          name: "Dashboard Layout Test",
          description:
            "Testing different dashboard layouts for better user engagement",
          type: "ui_variant",
          goal: "user_engagement",
          status: "active",
          variants: {
            control: { name: "Current Layout", weight: 50 },
            variant_a: { name: "New Grid Layout", weight: 50 },
          },
          schedule: {
            startDate: new Date("2024-01-15"),
            minSampleSize: 1000,
          },
          results: {
            totalParticipants: 245,
            variantResults: {},
          },
          createdAt: "2024-01-10T10:00:00Z",
          createdBy: "admin",
        },
        {
          _id: "2",
          name: "Pricing Page CTA",
          description:
            "Testing different call-to-action buttons on pricing page",
          type: "content",
          goal: "conversion_rate",
          status: "draft",
          variants: {
            control: { name: "Start Free Trial", weight: 33 },
            variant_a: { name: "Get Started Today", weight: 33 },
            variant_b: { name: "Try for Free", weight: 34 },
          },
          schedule: {
            startDate: new Date("2024-02-01"),
            minSampleSize: 500,
          },
          createdAt: "2024-01-20T14:30:00Z",
          createdBy: "admin",
        },
      ];
      setTests(mockTests);
      calculateStats(mockTests);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (testList: ABTest[]) => {
    const totalTests = testList.length;
    const activeTests = testList.filter((t) => t.status === "active").length;
    const completedTests = testList.filter(
      (t) => t.status === "completed"
    ).length;
    const totalParticipants = testList.reduce(
      (sum, t) => sum + (t.results?.totalParticipants || 0),
      0
    );

    setStats({
      totalTests,
      activeTests,
      completedTests,
      totalParticipants,
    });
  };

  const handleStatusChange = async (
    testId: string,
    action: "start" | "stop"
  ) => {
    try {
      const response = await api.put(`/ab-testing/tests/${testId}/${action}`);
      if (response.data.success) {
        await fetchTests(); // Refresh the list
      }
    } catch (error) {
      console.error(`Failed to ${action} test:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      feature_flag: "Feature Flag",
      ui_variant: "UI Variant",
      algorithm: "Algorithm",
      pricing: "Pricing",
      content: "Content",
    };
    return (
      <Badge variant="outline">
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  const getGoalBadge = (goal: string) => {
    const goalLabels = {
      conversion_rate: "Conversion Rate",
      click_through_rate: "CTR",
      time_on_page: "Time on Page",
      revenue: "Revenue",
      user_engagement: "Engagement",
      report_generation: "Reports",
    };
    return (
      <Badge variant="outline">
        {goalLabels[goal as keyof typeof goalLabels] || goal}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">A/B Testing</h1>
              <p className="mt-2 text-gray-600">
                Create and manage experiments to optimize user experience
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">Back to Admin</Button>
              </Link>
              <Link href="/admin/ab-testing/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Test
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tests
              </CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Tests
              </CardTitle>
              <BarChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalParticipants.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Experiments</CardTitle>
            <CardDescription>
              Manage your A/B testing experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {test.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(test.type)}</TableCell>
                    <TableCell>{getGoalBadge(test.goal)}</TableCell>
                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                    <TableCell>
                      {test.results?.totalParticipants || 0}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(test.schedule.startDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/ab-testing/results/${test._id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Test
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {test.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(test._id, "start")
                              }
                              className="text-green-600"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Test
                            </DropdownMenuItem>
                          )}
                          {test.status === "active" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(test._id, "stop")
                                }
                                className="text-orange-600"
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Test
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(test._id, "stop")
                                }
                                className="text-blue-600"
                              >
                                <Square className="mr-2 h-4 w-4" />
                                Stop Test
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
