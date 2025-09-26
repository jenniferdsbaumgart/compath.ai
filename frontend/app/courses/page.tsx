"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Coins,
  PlayCircle,
  Star,
  Users,
  CheckCircle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CoinDisplay } from "@/components/ui/coin-display";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useProtectedRoute } from "@/hooks/protected-route";

interface Course {
  id: string;
  title: string;
  description: string;
  coinCost?: number;
  duration?: string;
  category?: string;
  enrolled?: boolean;
  progress?: number;
  completedAt?: string;
  enrolledAt?: string;
}

interface CoursesData {
  available: Course[];
  enrolled: Course[];
  completed: Course[];
}

export default function CoursesPage() {
  const router = useRouter();
  useProtectedRoute();
  const { toast } = useToast();
  const [coursesData, setCoursesData] = useState<CoursesData>({
    available: [],
    enrolled: [],
    completed: [],
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "available" | "enrolled" | "completed"
  >("available");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // TODO: Replace with actual API calls when backend is implemented
      // For now, using mock data
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "Introdução ao Empreendedorismo",
          description:
            "Aprenda os fundamentos do empreendedorismo e como identificar oportunidades de negócio.",
          coinCost: 100,
          duration: "2h 30min",
          category: "Fundamentos",
        },
        {
          id: "2",
          title: "Análise de Mercado com IA",
          description:
            "Como usar inteligência artificial para analisar mercados e identificar tendências.",
          coinCost: 150,
          duration: "3h 15min",
          category: "Análise",
        },
        {
          id: "3",
          title: "Validação de Ideias",
          description:
            "Técnicas práticas para validar suas ideias de negócio antes de investir tempo e dinheiro.",
          coinCost: 120,
          duration: "2h 45min",
          category: "Validação",
        },
        {
          id: "4",
          title: "Estratégias de Precificação",
          description:
            "Como definir preços competitivos que maximizem seus lucros e conquistam mercado.",
          coinCost: 180,
          duration: "4h 00min",
          category: "Estratégia",
        },
      ];

      // Mock enrolled courses
      const mockEnrolled: Course[] = [
        {
          id: "1",
          title: "Introdução ao Empreendedorismo",
          description:
            "Aprenda os fundamentos do empreendedorismo e como identificar oportunidades de negócio.",
          coinCost: 100,
          duration: "2h 30min",
          category: "Fundamentos",
          enrolled: true,
          progress: 75,
          enrolledAt: "2025-01-15",
        },
      ];

      // Mock completed courses
      const mockCompleted: Course[] = [
        {
          id: "5",
          title: "Marketing Digital Básico",
          description:
            "Fundamentos do marketing digital para empreendedores iniciantes.",
          coinCost: 90,
          duration: "1h 45min",
          category: "Marketing",
          enrolled: true,
          progress: 100,
          completedAt: "2025-01-10",
        },
      ];

      setCoursesData({
        available: mockCourses,
        enrolled: mockEnrolled,
        completed: mockCompleted,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string, coinCost: number) => {
    if (!user || user.coins < coinCost) {
      toast({
        title: "Moedas insuficientes",
        description:
          "Você não tem moedas suficientes para se matricular neste curso.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement actual enrollment API call
      toast({
        title: "Matrícula realizada!",
        description: "Você foi matriculado no curso com sucesso.",
      });

      // Refresh courses data
      fetchCourses();
    } catch (error) {
      toast({
        title: "Erro na matrícula",
        description: "Não foi possível realizar a matrícula. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getCurrentCourses = () => {
    switch (activeTab) {
      case "enrolled":
        return coursesData.enrolled;
      case "completed":
        return coursesData.completed;
      default:
        return coursesData.available;
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {course.description}
            </CardDescription>
          </div>
          {course.enrolled && course.progress === 100 && (
            <Award className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </div>
            )}
            {course.coinCost && (
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                <CoinDisplay amount={course.coinCost} />
              </div>
            )}
          </div>

          {course.category && (
            <Badge variant="secondary">{course.category}</Badge>
          )}

          {course.enrolled && course.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          {course.completedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Concluído em{" "}
              {new Date(course.completedAt).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {course.enrolled ? (
          <Button asChild className="w-full">
            <Link href={`/courses/${course.id}`}>
              {course.progress === 100 ? "Ver Certificado" : "Continuar Curso"}
              <PlayCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleEnroll(course.id, course.coinCost || 0)}
            disabled={!user || user.coins < (course.coinCost || 0)}
          >
            Matricular-se
            {course.coinCost && course.coinCost > 0 && (
              <CoinDisplay amount={course.coinCost} className="ml-2" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cursos</h1>
          <p className="text-muted-foreground">
            Aprenda com especialistas e desenvolva suas habilidades
            empreendedoras
          </p>
        </div>

        {/* User coins display */}
        {user && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-secondary/20 rounded-lg">
            <Coins className="h-5 w-5" />
            <span className="font-medium">Suas moedas:</span>
            <CoinDisplay amount={user.coins} className="font-bold" />
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant={activeTab === "available" ? "default" : "ghost"}
            onClick={() => setActiveTab("available")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Disponíveis ({coursesData.available.length})
          </Button>
          <Button
            variant={activeTab === "enrolled" ? "default" : "ghost"}
            onClick={() => setActiveTab("enrolled")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Em andamento ({coursesData.enrolled.length})
          </Button>
          <Button
            variant={activeTab === "completed" ? "default" : "ghost"}
            onClick={() => setActiveTab("completed")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Concluídos ({coursesData.completed.length})
          </Button>
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentCourses().map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {getCurrentCourses().length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {activeTab === "available"
                ? "Nenhum curso disponível"
                : activeTab === "enrolled"
                ? "Nenhum curso em andamento"
                : "Nenhum curso concluído"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "available"
                ? "Novos cursos estarão disponíveis em breve."
                : "Matricule-se em um curso para começar sua jornada."}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
