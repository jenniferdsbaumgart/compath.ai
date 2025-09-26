import { useState, useEffect } from "react";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  placement: "top" | "bottom" | "left" | "right";
  showSkip?: boolean;
  showPrevious?: boolean;
}

export interface GuidedTour {
  id: string;
  name: string;
  steps: TourStep[];
  completed: boolean;
  version: number;
}

export interface UseGuidedTourReturn {
  currentTour: GuidedTour | null;
  currentStepIndex: number;
  isActive: boolean;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  restartTour: (tourId: string) => void;
}

// Predefined tours
const tours: GuidedTour[] = [
  {
    id: "dashboard-tour",
    name: "Tour do Dashboard",
    version: 1,
    completed: false,
    steps: [
      {
        id: "welcome",
        title: "Bem-vindo ao seu Dashboard!",
        description:
          "Este é o centro de controle da sua jornada empreendedora. Aqui você pode acompanhar seu progresso e acessar todas as funcionalidades.",
        target: '[data-tour="dashboard-header"]',
        placement: "bottom",
        showSkip: true,
      },
      {
        id: "coins-display",
        title: "Suas Moedas",
        description:
          "Suas moedas são a moeda da plataforma. Use-as para acessar cursos, realizar pesquisas e muito mais!",
        target: '[data-tour="coins-display"]',
        placement: "bottom",
      },
      {
        id: "active-courses",
        title: "Cursos Ativos",
        description:
          "Aqui você vê os cursos que está fazendo atualmente. Continue aprendendo para desbloquear certificados!",
        target: '[data-tour="active-courses"]',
        placement: "top",
        showPrevious: true,
      },
      {
        id: "quick-actions",
        title: "Ações Rápidas",
        description:
          "Use estes botões para acessar rapidamente as funcionalidades mais importantes.",
        target: '[data-tour="quick-actions"]',
        placement: "top",
        showPrevious: true,
      },
      {
        id: "navigation",
        title: "Navegação",
        description:
          "Use o menu lateral para acessar todas as seções da plataforma.",
        target: '[data-tour="navigation"]',
        placement: "right",
        showPrevious: true,
      },
    ],
  },
  {
    id: "courses-tour",
    name: "Tour dos Cursos",
    version: 1,
    completed: false,
    steps: [
      {
        id: "courses-intro",
        title: "Biblioteca de Cursos",
        description:
          "Explore nossa biblioteca completa de cursos para empreendedores. Cada curso é projetado para te ajudar a crescer.",
        target: '[data-tour="courses-header"]',
        placement: "bottom",
        showSkip: true,
      },
      {
        id: "course-filters",
        title: "Filtros e Pesquisa",
        description:
          "Use os filtros para encontrar cursos por categoria, duração ou custo em moedas.",
        target: '[data-tour="course-filters"]',
        placement: "bottom",
      },
      {
        id: "course-card",
        title: "Informações do Curso",
        description:
          "Cada cartão mostra informações importantes: custo em moedas, duração e categoria.",
        target: '[data-tour="course-card"]',
        placement: "right",
        showPrevious: true,
      },
      {
        id: "enroll-button",
        title: "Matrícula",
        description:
          'Clique em "Matricular-se" para começar um curso. Você precisa de moedas suficientes!',
        target: '[data-tour="enroll-button"]',
        placement: "top",
        showPrevious: true,
      },
    ],
  },
];

export function useGuidedTour(): UseGuidedTourReturn {
  const [currentTour, setCurrentTour] = useState<GuidedTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Load completed tours from localStorage
  useEffect(() => {
    const completedTours = JSON.parse(
      localStorage.getItem("completedTours") || "{}"
    );
    tours.forEach((tour) => {
      if (completedTours[tour.id] && completedTours[tour.id] >= tour.version) {
        tour.completed = true;
      }
    });
  }, []);

  const startTour = (tourId: string) => {
    const tour = tours.find((t) => t.id === tourId);
    if (!tour || tour.completed) return;

    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (!currentTour) return;

    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipTour = () => {
    endTour();
  };

  const endTour = () => {
    if (currentTour) {
      // Mark tour as completed
      const completedTours = JSON.parse(
        localStorage.getItem("completedTours") || "{}"
      );
      completedTours[currentTour.id] = currentTour.version;
      localStorage.setItem("completedTours", JSON.stringify(completedTours));

      currentTour.completed = true;
    }

    setCurrentTour(null);
    setCurrentStepIndex(0);
    setIsActive(false);
  };

  const restartTour = (tourId: string) => {
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;

    // Reset completion status
    const completedTours = JSON.parse(
      localStorage.getItem("completedTours") || "{}"
    );
    delete completedTours[tourId];
    localStorage.setItem("completedTours", JSON.stringify(completedTours));

    tour.completed = false;
    startTour(tourId);
  };

  return {
    currentTour,
    currentStepIndex,
    isActive,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    endTour,
    restartTour,
  };
}
