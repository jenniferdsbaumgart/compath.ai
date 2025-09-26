"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Book,
  Coins,
  Award,
  Users,
  BarChart,
  Settings,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: "coins-1",
    question: "Como ganhar moedas na plataforma?",
    answer:
      "Você pode ganhar moedas das seguintes formas: 1) Convidando amigos (10 moedas por convite aceito), 2) Completando cursos (recompensas por lições concluídas), 3) Participando de eventos especiais, 4) Fazendo login diariamente.",
    category: "Moedas",
    tags: ["moedas", "ganhar", "recompensas"],
  },
  {
    id: "coins-2",
    question: "Como comprar moedas?",
    answer:
      "Para comprar moedas, acesse a página de pagamentos no menu lateral. Oferecemos pacotes de 100, 300 e 500 moedas com preços especiais. O pagamento é processado de forma segura através do Stripe.",
    category: "Moedas",
    tags: ["moedas", "comprar", "pagamento"],
  },
  {
    id: "courses-1",
    question: "Como me matricular em um curso?",
    answer:
      "Para se matricular em um curso: 1) Vá para a página de Cursos, 2) Escolha o curso desejado, 3) Verifique se você tem moedas suficientes, 4) Clique em 'Matricular-se'. O custo será deduzido automaticamente das suas moedas.",
    category: "Cursos",
    tags: ["cursos", "matrícula", "moedas"],
  },
  {
    id: "courses-2",
    question: "Como funciona o sistema de certificados?",
    answer:
      "Ao completar 100% de um curso, você automaticamente recebe um certificado. Você pode visualizá-lo e baixá-lo na página de Certificados. Os certificados incluem seu nome, o nome do curso, data de conclusão e código de verificação único.",
    category: "Cursos",
    tags: ["certificados", "cursos", "conclusão"],
  },
  {
    id: "research-1",
    question: "Como funciona a pesquisa de nicho?",
    answer:
      "A pesquisa de nicho usa inteligência artificial para analisar dados de mercado. Preencha o questionário no perfil empreendedor e nossa IA irá sugerir nichos promissores baseados em seus interesses, habilidades e dados de mercado reais.",
    category: "Pesquisa",
    tags: ["nicho", "pesquisa", "IA"],
  },
  {
    id: "research-2",
    question: "Quanto custa uma pesquisa de nicho?",
    answer:
      "Cada pesquisa custa 50 moedas. Você pode ganhar moedas através de convites, cursos ou comprando pacotes. As pesquisas incluem análise completa de mercado, concorrentes e oportunidades.",
    category: "Pesquisa",
    tags: ["pesquisa", "custo", "moedas"],
  },
  {
    id: "account-1",
    question: "Como atualizar meu perfil?",
    answer:
      "Acesse 'Meu Perfil' no menu lateral. Você pode atualizar suas informações pessoais, preferências e completar seu perfil empreendedor para melhores recomendações de nicho.",
    category: "Conta",
    tags: ["perfil", "conta", "atualizar"],
  },
  {
    id: "account-2",
    question: "Como alterar minha senha?",
    answer:
      "Na página de configurações, você encontra a opção 'Alterar Senha'. Digite sua senha atual e a nova senha desejada. Recomendamos usar senhas fortes com pelo menos 8 caracteres.",
    category: "Conta",
    tags: ["senha", "segurança", "conta"],
  },
  {
    id: "analytics-1",
    question: "O que mostra o dashboard de analytics?",
    answer:
      "O analytics mostra métricas detalhadas sobre: usuários ativos, conversões, retenção, performance dos cursos, distribuição geográfica dos usuários, e muito mais. É uma ferramenta poderosa para tomada de decisões.",
    category: "Analytics",
    tags: ["analytics", "dashboard", "métricas"],
  },
  {
    id: "support-1",
    question: "Como entro em contato com o suporte?",
    answer:
      "Você pode nos contatar através: 1) Chat ao vivo (ícone no canto inferior direito), 2) Email: suporte@compath.ai, 3) WhatsApp: (11) 99999-9999, 4) Formulário nesta página de ajuda.",
    category: "Suporte",
    tags: ["suporte", "contato", "ajuda"],
  },
];

const categories = [
  { id: "all", name: "Todas", icon: HelpCircle },
  { id: "Moedas", name: "Moedas", icon: Coins },
  { id: "Cursos", name: "Cursos", icon: Book },
  { id: "Pesquisa", name: "Pesquisa", icon: BarChart },
  { id: "Conta", name: "Conta", icon: Settings },
  { id: "Analytics", name: "Analytics", icon: BarChart },
  { id: "Suporte", name: "Suporte", icon: MessageSquare },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredFAQs, setFilteredFAQs] = useState(faqData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterFAQs(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterFAQs(searchQuery, category);
  };

  const filterFAQs = (query: string, category: string) => {
    let filtered = faqData;

    if (category !== "all") {
      filtered = filtered.filter((faq) => faq.category === category);
    }

    if (query) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.answer.toLowerCase().includes(query.toLowerCase()) ||
          faq.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    setFilteredFAQs(filtered);
  };

  const quickLinks = [
    { title: "Tutorial do Dashboard", href: "#", icon: BarChart },
    { title: "Como Ganhar Moedas", href: "#", icon: Coins },
    { title: "Guia dos Cursos", href: "#", icon: Book },
    { title: "Dicas de Pesquisa", href: "#", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Centro de Ajuda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas ou entre em contato conosco.
            Estamos aqui para ajudar você a ter a melhor experiência possível.
          </p>
        </div>

        {/* Search and Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Search */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar na Central de Ajuda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite sua pergunta..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name}
                {selectedCategory === category.id && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredFAQs.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              {filteredFAQs.length} resultado
              {filteredFAQs.length !== 1 ? "s" : ""} encontrado
              {filteredFAQs.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <div className="font-medium">{faq.question}</div>
                      <div className="flex gap-1 mt-1">
                        {faq.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma resposta encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não encontramos respostas para sua busca. Tente reformular sua
                  pergunta ou entre em contato conosco.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Fale Conosco
              </CardTitle>
              <CardDescription>
                Nossa equipe está pronta para ajudar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    suporte@compath.ai
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    (11) 99999-9999
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Chat ao Vivo</p>
                  <p className="text-sm text-muted-foreground">
                    Disponível 24/7
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tem uma sugestão?</CardTitle>
              <CardDescription>
                Ajude-nos a melhorar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Suas ideias são importantes para nós. Compartilhe sugestões,
                reporte bugs ou diga o que podemos melhorar.
              </p>
              <Button className="w-full">Enviar Feedback</Button>
            </CardContent>
          </Card>
        </div>

        {/* Video Tutorials */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Tutoriais em Vídeo
            </CardTitle>
            <CardDescription>
              Aprenda com nossos vídeos explicativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Como usar o Dashboard",
                "Sistema de Moedas Explicado",
                "Matriculando-se em Cursos",
                "Realizando Pesquisa de Nicho",
              ].map((title, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium">{title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Duração: 3-5 min
                  </p>
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
