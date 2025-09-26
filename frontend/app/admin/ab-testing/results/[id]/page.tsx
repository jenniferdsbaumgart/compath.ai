"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ABTestResult {
  _id: string;
  name: string;
  description: string;
  type: string;
  goal: string;
  status: string;
  variants: { [key: string]: any };
  schedule: {
    startDate: Date;
    endDate?: Date;
    minSampleSize?: number;
    statisticalSignificance?: number;
  };
  results?: {
    startDate: Date;
    endDate?: Date;
    totalParticipants: number;
    variantResults: {
      [variantId: string]: {
        participants: number;
        conversions: number;
        conversionRate: number;
        confidenceInterval: [number, number];
        statisticalSignificance: boolean;
        metrics: {
          [metricName: string]: {
            value: number;
            variance: number;
            sampleSize: number;
          };
        };
      };
    };
  };
  createdAt: string;
}

export default function ABTestResultsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<ABTestResult | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      await fetchTestResults();
    };

    checkAccess();
  }, [router, testId]);

  const fetchTestResults = async () => {
    try {
      // Fetch test details
      const testResponse = await api.get(`/ab-testing/tests/${testId}`);
      const testData = testResponse.data;

      if (testData.success) {
        setTest(testData.data);
      }

      // Fetch test results
      const resultsResponse = await api.get(`/ab-testing/tests/${testId}/results`);
      const resultsData = resultsResponse.data;

      if (resultsData.success) {
        setResults(resultsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch test results:", error);
      // Set mock data for development
      setTest({
        _id: testId,
        name: "Dashboard Layout Test",
        description: "Testing different dashboard layouts for better user engagement",
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
          startDate: new Date("2024-01-15"),
          totalParticipants: 450,
          variantResults: {
            control: {
              participants: 225,
              conversions: 45,
              conversionRate: 0.20,
              confidenceInterval: [0.15, 0.25],
              statisticalSignificance: true,
              metrics: {
                time_on_page: { value: 180, variance: 25, sampleSize: 225 },
                clicks: { value: 12, variance: 3, sampleSize: 225 },
              },
            },
            variant_a: {
              participants: 225,
              conversions: 58,
              conversionRate: 0.257,
              confidenceInterval: [0.20, 0.31],
              statisticalSignificance: true,
              metrics: {
                time_on_page: { value: 210, variance: 30, sampleSize: 225 },
                clicks: { value: 15, variance: 4, sampleSize: 225 },
              },
            },
          },
        },
        createdAt: "2024-01-10T10:00:00Z",
      });

      setResults({
        winner: "variant_a",
        improvement: 28.5,
        confidence: 95,
        recommendations: [
          "Variant A shows 28.5% improvement in conversion rate",
          "Statistical significance achieved with 95% confidence",
          "Recommend implementing Variant A across all users",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculateProgress = () => {
    if (!test?.schedule?.minSampleSize || !test?.results?.totalParticipants) {
      return 0;
    }
    return Math.min(
      (test.results.totalParticipants / test.schedule.minSampleSize) * 100,
      100
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Test not found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested A/B test could not be found.
          </p>
          <Link href="/admin/ab-testing">
            <Button>Back to A/B Testing</Button>
          </Link>
        </div>
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
            <div className="flex items-center space-x-4">
              <Link href="/admin/ab-testing">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{test.name}</h1>
                <p className="mt-2 text-gray-600">{test.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(test.status)}
              <Badge variant="outline">{test.type}</Badge>
              <Badge variant="outline">{test.goal}</Badge>
            </div>
          </div>
        </div>

        {/* Test Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {test.results?.totalParticipants || 0}
              </div>
              {test.schedule?.minSampleSize && (
                <div className="mt-2">
                  <Progress value={calculateProgress()} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculateProgress().toFixed(0)}% of target ({test.schedule.minSampleSize})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Duration</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {test.results?.startDate
                  ? Math.ceil(
                      (new Date().getTime() - new Date(test.results.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">days running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Winner</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results?.winner
                  ? test.variants[results.winner]?.name || results.winner
                  : "Pending"}
              </div>
              {results?.improvement && (
                <p className="text-xs text-muted-foreground">
                  +{results.improvement.toFixed(1)}% improvement
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Variant Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {test.results?.variantResults &&
            Object.entries(test.results.variantResults).map(([variantId, variantData]) => (
              <Card key={variantId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{test.variants[variantId]?.name || variantId}</span>
                    {results?.winner === variantId && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Weight: {test.variants[variantId]?.weight}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Participants</p>
                        <p className="text-2xl font-bold">{variantData.participants}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversions</p>
                        <p className="text-2xl font-bold">{variantData.conversions}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Conversion Rate: {(variantData.conversionRate * 100).toFixed(1)}%
                      </p>
                      <Progress value={variantData.conversionRate * 100} className="h-3" />
                    </div>

                    {variantData.statisticalSignificance && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Statistically Significant
                        </span>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p>
                        Confidence Interval: [
                        {(variantData.confidenceInterval[0] * 100).toFixed(1)}%,
                        {(variantData.confidenceInterval[1] * 100).toFixed(1)}%]
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Recommendations */}
        {results?.recommendations && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Variants Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Details about the test setup and variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Test Details</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Type:</dt>
                    <dd className="text-sm font-medium">{test.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Goal:</dt>
                    <dd className="text-sm font-medium">{test.goal}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Start Date:</dt>
                    <dd className="text-sm font-medium">
                      {new Date(test.schedule.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                  {test.schedule.endDate && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">End Date:</dt>
                      <dd className="text-sm font-medium">
                        {new Date(test.schedule.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className="font-medium mb-3">Variants</h4>
                <div className="space-y-3">
                  {Object.entries(test.variants).map(([key, variant]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-sm text-gray-600">{variant.description}</p>
                      </div>
                      <Badge variant="outline">{variant.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
