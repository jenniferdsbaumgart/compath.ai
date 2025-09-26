"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Coins,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Users,
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
import { CoinDisplay } from "@/components/ui/coin-display";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useProtectedRoute } from "@/hooks/protected-route";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  completed: boolean;
  order: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  coinCost?: number;
  duration?: string;
  category?: string;
  enrolled: boolean;
  progress: number;
  enrolledAt?: string;
  completedAt?: string;
  lessons: Lesson[];
  instructor: string;
  rating: number;
  studentsCount: number;
  certificateAvailable: boolean;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  useProtectedRoute();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // TODO: Replace with actual API call when backend is implemented
      // For now, using mock data
      const mockCourse: CourseDetail = {
        id: courseId,
        title: "Introdução ao Empreendedorismo",
        description:
          "Aprenda os fundamentos do empreendedorismo e como identificar oportunidades de negócio. Este curso completo vai te guiar desde a concepção da ideia até os primeiros passos para torná-la realidade.",
        coinCost: 100,
        duration: "2h 30min",
        category: "Fundamentos",
        enrolled: true,
        progress: 75,
        enrolledAt: "2025-01-15",
        lessons: [
          {
            id: "1",
            title: "O que é Empreendedorismo",
            description:
              "Conceitos básicos e diferenças entre empresário e empreendedor",
            duration: "15min",
            videoUrl: "https://example.com/video1.mp4",
            completed: true,
            order: 1,
          },
          {
            id: "2",
            title: "Identificando Oportunidades",
            description:
              "Como identificar problemas e transformá-los em oportunidades de negócio",
            duration: "20min",
            videoUrl: "https://example.com/video2.mp4",
            completed: true,
            order: 2,
          },
          {
            id: "3",
            title: "Validando sua Ideia",
            description:
              "Técnicas práticas para validar ideias antes de investir recursos",
            duration: "25min",
            videoUrl: "https://example.com/video3.mp4",
            completed: false,
            order: 3,
          },
          {
            id: "4",
            title: "Planejamento Básico",
            description: "Como criar um plano inicial para seu negócio",
            duration: "18min",
            videoUrl: "https://example.com/video4.mp4",
            completed: false,
            order: 4,
          },
          {
            id: "5",
            title: "Primeiros Passos",
            description: "Como começar a implementar sua ideia de negócio",
            duration: "22min",
            videoUrl: "https://example.com/video5.mp4",
            completed: false,
            order: 5,
          },
        ],
        instructor: "Prof. Maria Silva",
        rating: 4.8,
        studentsCount: 1250,
        certificateAvailable: false,
      };

      setCourse(mockCourse);
      // Set first incomplete lesson as current, or first lesson if all completed
      const firstIncomplete = mockCourse.lessons.find((l) => !l.completed);
      setCurrentLesson(firstIncomplete || mockCourse.lessons[0]);
    } catch (error) {
      console.error("Error fetching course detail:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do curso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!course) return;

    try {
      // TODO: Implement actual API call
      const updatedLessons = course.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      );

      const completedCount = updatedLessons.filter((l) => l.completed).length;
      const newProgress = Math.round(
        (completedCount / updatedLessons.length) * 100
      );

      setCourse({
        ...course,
        lessons: updatedLessons,
        progress: newProgress,
        certificateAvailable: newProgress === 100,
      });

      toast({
        title: "Lição concluída!",
        description: "Parabéns! Você completou esta lição.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a lição como concluída.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCertificate = async () => {
    // TODO: Implement certificate download
    toast({
      title: "Certificado",
      description: "Funcionalidade de download em desenvolvimento.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Curso não encontrado.</p>
          <Button onClick={() => router.push("/courses")} className="mt-4">
            Voltar aos cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/courses")}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar aos cursos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.studentsCount} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <Badge variant="secondary">{course.category}</Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Progresso do curso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-3" />
              </div>

              {course.certificateAvailable && (
                <Button onClick={handleDownloadCertificate} className="mb-6">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Certificado
                </Button>
              )}
            </div>

            {/* Video Player Placeholder */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    {currentLesson?.videoUrl ? (
                      <video
                        controls
                        className="w-full h-full rounded-lg"
                        src={currentLesson.videoUrl}
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    ) : (
                      <div className="text-center">
                        <PlayCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Video player em desenvolvimento
                        </p>
                      </div>
                    )}
                  </div>
                  {currentLesson && (
                    <div>
                      <h3 className="font-medium mb-2">
                        {currentLesson.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {currentLesson.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {currentLesson.duration}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleLessonComplete(currentLesson.id)}
                          disabled={currentLesson.completed}
                        >
                          {currentLesson.completed ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Concluída
                            </>
                          ) : (
                            "Marcar como concluída"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Curso</CardTitle>
            <CardDescription>
              {course.lessons.filter((l) => l.completed).length} de{" "}
              {course.lessons.length} lições concluídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    currentLesson?.id === lesson.id
                      ? "bg-primary/5 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setCurrentLesson(lesson)}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      lesson.completed
                        ? "bg-green-100 text-green-700"
                        : currentLesson?.id === lesson.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      lesson.order
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {lesson.duration}
                  </div>

                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
