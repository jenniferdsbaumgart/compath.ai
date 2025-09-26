"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Save,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useEffect } from "react";

interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export default function CreateABTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    goal: "",
    minSampleSize: 1000,
    startDate: new Date().toISOString().split('T')[0],
  });

  const [variants, setVariants] = useState<Variant[]>([
    { id: "control", name: "Control", description: "Current version", weight: 50 },
    { id: "variant_a", name: "Variant A", description: "New version", weight: 50 },
  ]);

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
    };

    checkAccess();
  }, [router]);

  const addVariant = () => {
    const variantLetters = ['a', 'b', 'c', 'd', 'e'];
    const nextIndex = variants.length - 1; // -1 because control is index 0
    const nextLetter = variantLetters[nextIndex] || 'x';

    const newVariant: Variant = {
      id: `variant_${nextLetter}`,
      name: `Variant ${nextLetter.toUpperCase()}`,
      description: `Test variant ${nextLetter.toUpperCase()}`,
      weight: 0,
    };

    setVariants([...variants, newVariant]);
    redistributeWeights();
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return; // Keep at least 2 variants

    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    redistributeWeights();
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const redistributeWeights = () => {
    const totalVariants = variants.length;
    const equalWeight = Math.floor(100 / totalVariants);
    const remainder = 100 % totalVariants;

    const newVariants = variants.map((variant, index) => ({
      ...variant,
      weight: equalWeight + (index < remainder ? 1 : 0),
    }));

    setVariants(newVariants);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    if (!formData.description.trim()) return false;
    if (!formData.type) return false;
    if (!formData.goal) return false;

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) return false;

    return variants.every(v => v.name.trim() && v.description.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill all required fields and ensure variant weights total 100%");
      return;
    }

    setIsLoading(true);

    try {
      const testData = {
        ...formData,
        variants: variants.reduce((acc, variant) => {
          acc[variant.id] = {
            name: variant.name,
            description: variant.description,
            weight: variant.weight,
            config: {}, // Empty config for now
          };
          return acc;
        }, {} as any),
        targetAudience: {
          userSegments: [],
          countries: [],
          userTypes: [],
          excludeUserIds: [],
        },
        schedule: {
          startDate: new Date(formData.startDate),
          minSampleSize: formData.minSampleSize,
          statisticalSignificance: 0.05,
        },
        metadata: {
          priority: "medium",
        },
      };

      const response = await api.post("/ab-testing/tests", testData);

      if (response.data.success) {
        router.push("/admin/ab-testing");
      } else {
        alert("Failed to create test: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Failed to create test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Create A/B Test</h1>
                <p className="mt-2 text-gray-600">
                  Set up a new experiment to optimize user experience
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Define the core details of your A/B test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Test Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Dashboard Layout Test"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Test Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature_flag">Feature Flag</SelectItem>
                        <SelectItem value="ui_variant">UI Variant</SelectItem>
                        <SelectItem value="algorithm">Algorithm</SelectItem>
                        <SelectItem value="pricing">Pricing</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you're testing and why..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal *</Label>
                    <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        <SelectItem value="click_through_rate">Click Through Rate</SelectItem>
                        <SelectItem value="time_on_page">Time on Page</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="user_engagement">User Engagement</SelectItem>
                        <SelectItem value="report_generation">Report Generation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minSampleSize">Min Sample Size</Label>
                    <Input
                      id="minSampleSize"
                      type="number"
                      value={formData.minSampleSize}
                      onChange={(e) => setFormData({ ...formData, minSampleSize: parseInt(e.target.value) || 1000 })}
                      min="100"
                      max="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Test Variants</CardTitle>
                    <CardDescription>
                      Define the different versions you want to test
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    disabled={variants.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FlaskConical className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{variant.id.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        {variants.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="Variant name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description *</Label>
                          <Input
                            value={variant.description}
                            onChange={(e) => updateVariant(index, 'description', e.target.value)}
                            placeholder="Brief description"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Traffic Weight (%)</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={variant.weight}
                              onChange={(e) => updateVariant(index, 'weight', parseInt(e.target.value) || 0)}
                              min="0"
                              max="100"
                              className="w-20"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Weight:</span>
                    <Badge variant={variants.reduce((sum, v) => sum + v.weight, 0) === 100 ? "default" : "destructive"}>
                      {variants.reduce((sum, v) => sum + v.weight, 0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Link href="/admin/ab-testing">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || !validateForm()}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
