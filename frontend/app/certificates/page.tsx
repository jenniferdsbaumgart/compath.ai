"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Download,
  Calendar,
  Clock,
  Star,
  BookOpen,
  Share2,
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
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useProtectedRoute } from "@/hooks/protected-route";

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  instructor: string;
  completedAt: string;
  duration: string;
  certificateId: string;
  skills: string[];
}

export default function CertificatesPage() {
  const router = useRouter();
  useProtectedRoute();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // TODO: Replace with actual API call when backend is implemented
      // For now, using mock data
      const mockCertificates: Certificate[] = [
        {
          id: "cert_1",
          courseId: "5",
          courseTitle: "Marketing Digital Básico",
          courseDescription:
            "Fundamentos do marketing digital para empreendedores iniciantes.",
          instructor: "Prof. Ana Paula",
          completedAt: "2025-01-10T10:30:00Z",
          duration: "1h 45min",
          certificateId: "CERT-2025-001",
          skills: [
            "Marketing Digital",
            "Redes Sociais",
            "SEO Básico",
            "Google Ads",
          ],
        },
        {
          id: "cert_2",
          courseId: "1",
          courseTitle: "Introdução ao Empreendedorismo",
          courseDescription:
            "Aprenda os fundamentos do empreendedorismo e como identificar oportunidades de negócio.",
          instructor: "Prof. Maria Silva",
          completedAt: "2025-01-20T14:15:00Z",
          duration: "2h 30min",
          certificateId: "CERT-2025-002",
          skills: [
            "Empreendedorismo",
            "Ideias de Negócio",
            "Planejamento",
            "Validação",
          ],
        },
      ];

      setCertificates(mockCertificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os certificados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      // TODO: Implement actual certificate generation/download
      // For now, create a simple certificate text
      const certificateText = `
CERTIFICADO DE CONCLUSÃO

Compath.ai certifica que

${user?.name || "Nome do Usuário"}

concluiu com sucesso o curso

"${certificate.courseTitle}"

com carga horária de ${certificate.duration}

Data de conclusão: ${new Date(certificate.completedAt).toLocaleDateString(
        "pt-BR"
      )}

ID do Certificado: ${certificate.certificateId}

Compath.ai - Plataforma de Apoio a Empreendedores
      `.trim();

      // Create and download text file
      const blob = new Blob([certificateText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${certificate.certificateId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Certificado baixado!",
        description: "O certificado foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o certificado.",
        variant: "destructive",
      });
    }
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    const shareText = `Concluí o curso "${certificate.courseTitle}" na plataforma Compath.ai! 🎓\n\nCertificado ID: ${certificate.certificateId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Certificado Compath.ai",
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copiado!",
        description:
          "O link do certificado foi copiado para a área de transferência.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Certificados</h1>
          <p className="text-muted-foreground">
            Seus certificados de conclusão de cursos
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">
              Nenhum certificado ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Complete seus cursos para receber certificados de conclusão.
            </p>
            <Button onClick={() => router.push("/courses")}>
              Ver cursos disponíveis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="relative overflow-hidden">
                {/* Certificate background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/5 rounded-tr-full" />

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-primary" />
                        Certificado de Conclusão
                      </CardTitle>
                      <CardDescription className="font-medium text-foreground">
                        {certificate.courseTitle}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {certificate.certificateId}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Concluído em</p>
                        <p className="text-muted-foreground">
                          {new Date(certificate.completedAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Carga horária</p>
                        <p className="text-muted-foreground">
                          {certificate.duration}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Instrutor</p>
                    <p className="text-sm text-muted-foreground">
                      {certificate.instructor}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Competências Desenvolvidas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShareCertificate(certificate)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Continue aprendendo</h3>
              <p className="text-muted-foreground mb-4">
                Complete mais cursos e ganhe novos certificados para seu perfil
                profissional.
              </p>
              <Button onClick={() => router.push("/courses")}>
                Explorar cursos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
