import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface Course {
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
  lessons?: Lesson[];
  instructor?: string;
  rating?: number;
  studentsCount?: number;
  certificateAvailable?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  completed: boolean;
  order: number;
}

export interface CoursesData {
  available: Course[];
  enrolled: Course[];
  completed: Course[];
}

export interface UseCoursesReturn {
  courses: CoursesData;
  isLoading: boolean;
  error: string | null;
  enrollInCourse: (courseId: string) => Promise<void>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

// Mock data for development
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introdução ao Empreendedorismo",
    description:
      "Aprenda os fundamentos do empreendedorismo e como identificar oportunidades de negócio.",
    coinCost: 100,
    duration: "2h 30min",
    category: "Fundamentos",
    instructor: "Prof. Maria Silva",
    rating: 4.8,
    studentsCount: 1250,
  },
  {
    id: "2",
    title: "Análise de Mercado com IA",
    description:
      "Como usar inteligência artificial para analisar mercados e identificar tendências.",
    coinCost: 150,
    duration: "3h 15min",
    category: "Análise",
    instructor: "Prof. João Santos",
    rating: 4.9,
    studentsCount: 890,
  },
  {
    id: "3",
    title: "Validação de Ideias",
    description:
      "Técnicas práticas para validar suas ideias de negócio antes de investir tempo e dinheiro.",
    coinCost: 120,
    duration: "2h 45min",
    category: "Validação",
    instructor: "Dra. Ana Costa",
    rating: 4.7,
    studentsCount: 654,
  },
  {
    id: "4",
    title: "Estratégias de Precificação",
    description:
      "Como definir preços competitivos que maximizem seus lucros e conquistam mercado.",
    coinCost: 180,
    duration: "4h 00min",
    category: "Estratégia",
    instructor: "Prof. Carlos Lima",
    rating: 4.6,
    studentsCount: 432,
  },
];

const mockEnrolledCourses: Course[] = [
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
    certificateAvailable: false,
  },
];

const mockCompletedCourses: Course[] = [
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
    certificateAvailable: true,
  },
];

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<CoursesData>({
    available: [],
    enrolled: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API calls when backend is implemented
      // const availableResponse = await api.get('/courses/available');
      // const enrolledResponse = await api.get('/courses/enrolled');
      // const completedResponse = await api.get('/courses/completed');

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCourses({
        available: mockCourses,
        enrolled: mockEnrolledCourses,
        completed: mockCompletedCourses,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cursos");
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      // TODO: Implement actual enrollment API call
      // await api.post(`/courses/${courseId}/enroll`);

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update local state
      setCourses((prev) => {
        const course = prev.available.find((c) => c.id === courseId);
        if (!course) return prev;

        return {
          available: prev.available.filter((c) => c.id !== courseId),
          enrolled: [
            ...prev.enrolled,
            {
              ...course,
              enrolled: true,
              progress: 0,
              enrolledAt: new Date().toISOString(),
            },
          ],
          completed: prev.completed,
        };
      });
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Erro ao se matricular no curso"
      );
    }
  };

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    try {
      // TODO: Implement actual lesson completion API call
      // await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Update local state
      setCourses((prev) => ({
        ...prev,
        enrolled: prev.enrolled.map((course) =>
          course.id === courseId && course.progress !== undefined
            ? { ...course, progress: Math.min(course.progress + 20, 100) }
            : course
        ),
      }));
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Erro ao marcar lição como concluída"
      );
    }
  };

  const refreshCourses = async () => {
    await fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    enrollInCourse,
    markLessonComplete,
    refreshCourses,
  };
}
