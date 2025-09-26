"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { useGuidedTour, TourStep } from "@/hooks/use-guided-tour";

interface GuidedTourProps {
  tourId: string;
  autoStart?: boolean;
  className?: string;
}

export function GuidedTour({
  tourId,
  autoStart = false,
  className,
}: GuidedTourProps) {
  const {
    currentTour,
    currentStepIndex,
    isActive,
    nextStep,
    previousStep,
    skipTour,
    endTour,
  } = useGuidedTour();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (autoStart && !currentTour) {
      // Auto-start logic would go here, but we handle it in the hook
    }
  }, [autoStart, currentTour]);

  useEffect(() => {
    if (isActive && currentTour) {
      // Highlight target element
      const step = currentTour.steps[currentStepIndex];
      if (step) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          targetElement.classList.add("tour-highlight");
        }
      }
    }

    // Cleanup highlight
    return () => {
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    };
  }, [isActive, currentTour, currentStepIndex]);

  if (!mounted || !isActive || !currentTour) {
    return null;
  }

  const currentStep = currentTour.steps[currentStepIndex];
  const isLastStep = currentStepIndex === currentTour.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Calculate position based on target element and placement
  const getTooltipPosition = (step: TourStep) => {
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return { top: "50%", left: "50%" };

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320; // Approximate width
    const tooltipHeight = 200; // Approximate height

    switch (step.placement) {
      case "top":
        return {
          top: `${rect.top - tooltipHeight - 10}px`,
          left: `${rect.left + rect.width / 2 - tooltipWidth / 2}px`,
        };
      case "bottom":
        return {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2 - tooltipWidth / 2}px`,
        };
      case "left":
        return {
          top: `${rect.top + rect.height / 2 - tooltipHeight / 2}px`,
          left: `${rect.left - tooltipWidth - 10}px`,
        };
      case "right":
        return {
          top: `${rect.top + rect.height / 2 - tooltipHeight / 2}px`,
          left: `${rect.right + 10}px`,
        };
      default:
        return { top: "50%", left: "50%" };
    }
  };

  const position = getTooltipPosition(currentStep);

  const tourContent = (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={skipTour}
      />

      {/* Highlight target element */}
      {(() => {
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          return (
            <div
              className="absolute border-2 border-primary rounded-lg shadow-lg pointer-events-none"
              style={{
                top: `${rect.top - 4}px`,
                left: `${rect.left - 4}px`,
                width: `${rect.width + 8}px`,
                height: `${rect.height + 8}px`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.3)",
              }}
            />
          );
        }
        return null;
      })()}

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto"
        style={{
          ...position,
          minWidth: "320px",
          maxWidth: "400px",
        }}
      >
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentStepIndex + 1} de {currentTour.steps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{currentStep.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentStep.showPrevious && !isFirstStep && (
                  <Button variant="outline" size="sm" onClick={previousStep}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                )}

                <Button size="sm" onClick={nextStep}>
                  {isLastStep ? "Finalizar" : "Próximo"}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>

              {currentStep.showSkip && (
                <Button variant="ghost" size="sm" onClick={skipTour}>
                  Pular tour
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointing to target */}
        <div
          className="absolute w-0 h-0 border-8 border-transparent"
          style={{
            ...(() => {
              const targetElement = document.querySelector(currentStep.target);
              if (!targetElement) return {};

              const rect = targetElement.getBoundingClientRect();

              switch (currentStep.placement) {
                case "top":
                  return {
                    bottom: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderTopColor: "hsl(var(--card))",
                    borderTopWidth: "8px",
                  };
                case "bottom":
                  return {
                    top: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderBottomColor: "hsl(var(--card))",
                    borderBottomWidth: "8px",
                  };
                case "left":
                  return {
                    right: "-16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderLeftColor: "hsl(var(--card))",
                    borderLeftWidth: "8px",
                  };
                case "right":
                  return {
                    left: "-16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderRightColor: "hsl(var(--card))",
                    borderRightWidth: "8px",
                  };
                default:
                  return {};
              }
            })(),
          }}
        />
      </div>
    </div>
  );

  return createPortal(tourContent, document.body);
}

// Tour trigger button component
interface TourTriggerProps {
  tourId: string;
  children?: React.ReactNode;
  className?: string;
}

export function TourTrigger({ tourId, children, className }: TourTriggerProps) {
  const { startTour } = useGuidedTour();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => startTour(tourId)}
      className={className}
    >
      {children || (
        <>
          <Play className="h-4 w-4 mr-2" />
          Iniciar Tour
        </>
      )}
    </Button>
  );
}
