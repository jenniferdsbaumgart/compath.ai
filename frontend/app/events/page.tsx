"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Coins,
  BookOpen,
  Award,
  Activity,
  Download,
  Upload,
  MessageSquare,
  Settings,
  Eye,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useProtectedRoute } from "@/hooks/protected-route";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserEvent {
  id: string;
  type:
    | "user_action"
    | "system_action"
    | "achievement"
    | "purchase"
    | "course_progress";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    coins?: number;
    courseId?: string;
    courseTitle?: string;
    amount?: number;
    searchQuery?: string;
    achievementType?: string;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
}

export default function EventsPage() {
  const router = useRouter();
  useProtectedRoute();
  const { toast } = useToast();
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7d");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, eventTypeFilter, dateRange]);

  const fetchEvents = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // TODO: Replace with actual API call when backend is implemented
      // For now, using mock data
      const mockEvents: UserEvent[] = [
        {
          id: "evt_1",
          type: "achievement",
          title: "Curso Concluído",
          description: "Você concluiu o curso 'Marketing Digital Básico'",
          timestamp: "2025-01-20T14:30:00Z",
          metadata: {
            courseId: "5",
            courseTitle: "Marketing Digital Básico",
            achievementType: "course_completion",
          },
        },
        {
          id: "evt_2",
          type: "purchase",
          title: "Compra de Moedas",
          description: "Você comprou 100 moedas por R$ 9,90",
          timestamp: "2025-01-19T10:15:00Z",
          metadata: {
            amount: 100,
            coins: 100,
          },
        },
        {
          id: "evt_3",
          type: "course_progress",
          title: "Progresso no Curso",
          description: "Você concluiu a lição 'O que é Empreendedorismo'",
          timestamp: "2025-01-18T16:45:00Z",
          metadata: {
            courseId: "1",
            courseTitle: "Introdução ao Empreendedorismo",
          },
        },
        {
          id: "evt_4",
          type: "user_action",
          title: "Pesquisa Realizada",
          description: "Você realizou uma pesquisa de nicho para 'tecnologia'",
          timestamp: "2025-01-17T09:20:00Z",
          metadata: {
            searchQuery: "tecnologia",
          },
        },
        {
          id: "evt_5",
          type: "system_action",
          title: "Moedas Creditadas",
          description: "Você recebeu 50 moedas por convidar um amigo",
          timestamp: "2025-01-16T11:30:00Z",
          metadata: {
            coins: 50,
          },
        },
        {
          id: "evt_6",
          type: "user_action",
          title: "Perfil Atualizado",
          description: "Você atualizou seu perfil empreendedor",
          timestamp: "2025-01-15T13:10:00Z",
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de eventos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by event type
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === eventTypeFilter);
    }

    // Filter by date range
    const now = new Date();
    const daysAgo = parseInt(dateRange.replace("d", ""));
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    filtered = filtered.filter(
      (event) => new Date(event.timestamp) >= cutoffDate
    );

    // Sort by timestamp (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setFilteredEvents(filtered);
  };

  const getEventIcon = (type: UserEvent["type"]) => {
    switch (type) {
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "purchase":
        return <Coins className="h-5 w-5 text-green-500" />;
      case "course_progress":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "user_action":
        return <User className="h-5 w-5 text-purple-500" />;
      case "system_action":
        return <Activity className="h-5 w-5 text-orange-500" />;
      default:
        return <History className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (type: UserEvent["type"]) => {
    switch (type) {
      case "achievement":
        return "Conquista";
      case "purchase":
        return "Compra";
      case "course_progress":
        return "Curso";
      case "user_action":
        return "Ação do Usuário";
      case "system_action":
        return "Sistema";
      default:
        return "Evento";
    }
  };

  const getEventBadgeVariant = (type: UserEvent["type"]) => {
    switch (type) {
      case "achievement":
        return "default";
      case "purchase":
        return "secondary";
      case "course_progress":
        return "outline";
      case "user_action":
        return "secondary";
      case "system_action":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleExportEvents = async () => {
    try {
      const csvContent = [
        ["Data", "Tipo", "Título", "Descrição", "Detalhes"].join(","),
        ...filteredEvents.map((event) =>
          [
            new Date(event.timestamp).toLocaleString("pt-BR"),
            getEventTypeLabel(event.type),
            `"${event.title}"`,
            `"${event.description}"`,
            `"${JSON.stringify(event.metadata || {})}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historico-eventos-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "O histórico foi exportado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o histórico.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Histórico de Eventos</h1>
          <p className="text-muted-foreground">
            Acompanhe todas suas atividades e conquistas na plataforma
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={eventTypeFilter}
                onValueChange={setEventTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="achievement">Conquistas</SelectItem>
                  <SelectItem value="purchase">Compras</SelectItem>
                  <SelectItem value="course_progress">Cursos</SelectItem>
                  <SelectItem value="user_action">Ações do Usuário</SelectItem>
                  <SelectItem value="system_action">Sistema</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExportEvents} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Timeline */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-muted-foreground">
                  Não foram encontrados eventos com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event, index) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge
                              variant={getEventBadgeVariant(event.type)}
                              className="text-xs"
                            >
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {event.description}
                          </p>

                          {event.metadata && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {event.metadata.coins && (
                                <Badge variant="outline" className="text-xs">
                                  <Coins className="h-3 w-3 mr-1" />
                                  {event.metadata.coins} moedas
                                </Badge>
                              )}
                              {event.metadata.courseTitle && (
                                <Badge variant="outline" className="text-xs">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {event.metadata.courseTitle}
                                </Badge>
                              )}
                              {event.metadata.searchQuery && (
                                <Badge variant="outline" className="text-xs">
                                  <Search className="h-3 w-3 mr-1" />"
                                  {event.metadata.searchQuery}"
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.timestamp).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          <div>
                            {formatDistanceToNow(new Date(event.timestamp), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total de eventos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {events.filter((e) => e.type === "achievement").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Conquistas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {events.filter((e) => e.type === "course_progress").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Atividades de curso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      events.filter((e) =>
                        ["purchase", "system_action"].includes(e.type)
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Transações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
