'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';

// Types
type ProfileQuestion = {
  id: string;
  question: string;
  type: 'tags' | 'slider' | 'tree' | 'audience-tags';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  marks?: { value: number; label: string }[];
  treeOptions?: TreeOption[];
};

type TreeOption = {
  id: string;
  label: string;
  children?: TreeOption[];
};

type ProfileResponse = {
  [key: string]: any;
};

// Business areas tree structure
const businessAreas = [
  'Tecnologia',
  'Saúde e Bem-estar',
  'Educação',
  'E-commerce',
  'Serviços Profissionais',
  'Alimentação',
  'Moda e Beleza',
  'Sustentabilidade',
  'Finanças',
  'Entretenimento',
  'Pets',
  'Esportes',
];

const educationLevels = [
  'Ensino Fundamental',
  'Ensino Médio',
  'Ensino Superior',
  'Pós-graduação',
  'Mestrado',
  'Doutorado',
  'Técnico',
  'Cursos Livres',
]

const educationAreas = [
  'Ciências Exatas',
  'Ciências Biológicas',
  'Ciências da Saúde',
  'Engenharias',
  'Tecnologia da Informação',
  'Ciências Humanas',
  'Ciências Sociais Aplicadas',
  'Linguística, Letras e Artes',
  'Educação',
  'Direito',
  'Negócios e Administração',
  'Meio Ambiente e Sustentabilidade',
  'Comunicação e Mídias',
  'Design e Artes Visuais',
  'Psicologia e Comportamento',
  'Esportes e Educação Física',
];


// Hobbies and interests tree
const hobbiesTree: TreeOption[] = [
  {
    id: 'tech',
    label: 'Tecnologia',
    children: [
      {
        id: 'programming',
        label: 'Programação',
        children: [
          { id: 'web', label: 'Desenvolvimento Web' },
          { id: 'mobile', label: 'Apps Mobile' },
          { id: 'ai', label: 'Inteligência Artificial' },
          { id: 'datasci', label: 'Ciência de Dados' },
        ],
      },
      {
        id: 'gaming',
        label: 'Games',
        children: [
          { id: 'esports', label: 'E-Sports' },
          { id: 'gamedev', label: 'Desenvolvimento de Jogos' },
          { id: 'retro', label: 'Jogos Retrô' },
        ],
      },
      {
        id: 'gadgets',
        label: 'Gadgets e Invenções',
        children: [
          { id: 'drones', label: 'Drones' },
          { id: 'iot', label: 'Internet das Coisas (IoT)' },
        ],
      },
    ],
  },
  {
    id: 'health',
    label: 'Saúde e Bem-estar',
    children: [
      {
        id: 'fitness',
        label: 'Fitness',
        children: [
          { id: 'yoga', label: 'Yoga' },
          { id: 'crossfit', label: 'CrossFit' },
          { id: 'running', label: 'Corrida' },
          { id: 'gym', label: 'Musculação' },
        ],
      },
      {
        id: 'nutrition',
        label: 'Nutrição',
        children: [
          { id: 'vegan', label: 'Veganismo' },
          { id: 'organic', label: 'Alimentação Orgânica' },
          { id: 'lowcarb', label: 'Dieta Low Carb' },
        ],
      },
      {
        id: 'mental-health',
        label: 'Saúde Mental',
        children: [
          { id: 'meditation', label: 'Meditação' },
          { id: 'journaling', label: 'Escrita Terapêutica' },
        ],
      },
    ],
  },
  {
    id: 'arts',
    label: 'Artes e Cultura',
    children: [
      {
        id: 'visual-arts',
        label: 'Artes Visuais',
        children: [
          { id: 'painting', label: 'Pintura' },
          { id: 'photography', label: 'Fotografia' },
          { id: 'design', label: 'Design' },
          { id: 'sculpture', label: 'Escultura' },
        ],
      },
      {
        id: 'music',
        label: 'Música',
        children: [
          { id: 'instruments', label: 'Instrumentos' },
          { id: 'production', label: 'Produção Musical' },
          { id: 'singing', label: 'Canto' },
        ],
      },
      {
        id: 'literature',
        label: 'Literatura',
        children: [
          { id: 'reading', label: 'Leitura' },
          { id: 'writing', label: 'Escrita Criativa' },
          { id: 'poetry', label: 'Poesia' },
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Estilo de Vida',
    children: [
      {
        id: 'travel',
        label: 'Viagens',
        children: [
          { id: 'backpacking', label: 'Mochilão' },
          { id: 'roadtrips', label: 'Viagens de Carro' },
          { id: 'culture', label: 'Turismo Cultural' },
        ],
      },
      {
        id: 'home',
        label: 'Vida Doméstica',
        children: [
          { id: 'gardening', label: 'Jardinagem' },
          { id: 'diy', label: 'Faça Você Mesmo (DIY)' },
          { id: 'cooking', label: 'Culinária' },
        ],
      },
      {
        id: 'pets',
        label: 'Animais de Estimação',
        children: [
          { id: 'dogs', label: 'Cães' },
          { id: 'cats', label: 'Gatos' },
          { id: 'exotics', label: 'Animais Exóticos' },
        ],
      },
    ],
  },
  {
    id: 'business',
    label: 'Negócios e Carreira',
    children: [
      {
        id: 'entrepreneurship',
        label: 'Empreendedorismo',
        children: [
          { id: 'startups', label: 'Startups' },
          { id: 'marketing', label: 'Marketing Digital' },
          { id: 'finance', label: 'Finanças Pessoais' },
        ],
      },
      {
        id: 'development',
        label: 'Desenvolvimento Pessoal',
        children: [
          { id: 'leadership', label: 'Liderança' },
          { id: 'productivity', label: 'Produtividade' },
        ],
      },
    ],
  },
  {
    id: 'cooking',
    label: 'Culinária e Gastronomia',
    children: [
      {
        id: 'cuisine-types',
        label: 'Tipos de Culinária',
        children: [
          { id: 'brazilian', label: 'Comida Brasileira' },
          { id: 'italian', label: 'Culinária Italiana' },
          { id: 'japanese', label: 'Culinária Japonesa' },
          { id: 'arabic', label: 'Culinária Árabe' },
          { id: 'vegan-cuisine', label: 'Culinária Vegana' },
          { id: 'desserts', label: 'Sobremesas e Doces' },
        ],
      },
      {
        id: 'food-business',
        label: 'Negócios de Alimentação',
        children: [
          { id: 'restaurant', label: 'Restaurante' },
          { id: 'cafe', label: 'Cafeteria' },
          { id: 'foodtruck', label: 'Food Truck' },
          { id: 'homecooking', label: 'Comida Feita em Casa' },
          { id: 'artisanal', label: 'Produtos Artesanais (pães, queijos, geleias...)' },
          { id: 'brewery', label: 'Cervejaria Artesanal' },
        ],
      },
      {
        id: 'food-lifestyle',
        label: 'Estilo de Vida e Alimentação',
        children: [
          { id: 'gastronomy', label: 'Gastronomia' },
          { id: 'mealprep', label: 'Preparação de Marmitas' },
          { id: 'fermentation', label: 'Fermentação Artesanal (pães, kombucha, etc)' },
          { id: 'craftbeer', label: 'Produção de Cerveja Artesanal' },
        ],
      },
    ],
  }
];

// Target audience options
const audienceOptions = [
  'Jovens (18-25)',
  'Adultos (26-35)',
  'Profissionais (36-50)',
  'Seniors (50+)',
  'Estudantes',
  'Profissionais Liberais',
  'Empresários',
  'Famílias',
  'Crianças',
  'Adolescentes',
  'Atletas',
  'Artistas',
];

// Define questions
const profileQuestions: ProfileQuestion[] = [
  // {
  //   id: 'areas',
  //   question: 'Quais áreas de negócio mais te interessam?',
  //   type: 'tags',
  //   options: businessAreas,
  // },
    {
    id: 'education',
    question: 'Qual o seu nível de formação?',
    type: 'tags',
    options: educationLevels,
  },
      {
    id: 'areas',
    question: 'Qual é a área de formação',
    type: 'tags',
    options: educationAreas,
  },
  {
    id: 'investment',
    question: 'Quanto você está disposto a investir no seu novo negócio?',
    type: 'slider',
    min: 500,
    max: 50000,
    step: 500,
    marks: [
      { value: 500, label: 'R$500' },
      { value: 5000, label: 'R$5.000' },
      { value: 10000, label: 'R$10.000' },
      { value: 25000, label: 'R$25.000' },
      { value: 50000, label: 'R$50.000' },
    ],
  },
  {
    id: 'time',
    question: 'Quantas horas por semana você pode dedicar ao seu novo negócio?',
    type: 'slider',
    min: 5,
    max: 40,
    step: 5,
    marks: [
      { value: 5, label: '5h' },
      { value: 10, label: '10h' },
      { value: 20, label: '20h' },
      { value: 30, label: '30h' },
      { value: 40, label: '40h' },
    ],
  },
  {
    id: 'hobbies',
    question: 'Selecione seus principais hobbies e interesses:',
    type: 'tree',
    treeOptions: hobbiesTree,
  },
  {
    id: 'audience',
    question: 'Qual público-alvo você gostaria de atingir com seu produto ou serviço?',
    type: 'audience-tags',
    options: audienceOptions,
  },
];

export default function PerfilEmpreendedorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<ProfileResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserCoins(currentUser.coins);
    }

    // Load saved responses from localStorage
    const savedResponses = localStorage.getItem('entrepreneurProfile');
    const savedStep = localStorage.getItem('entrepreneurProfileStep');
    
    if (savedResponses) {
      const parsedResponses = JSON.parse(savedResponses);
      setResponses(parsedResponses);
      
      // Restore selected tags if they exist
      if (parsedResponses.areas) {
        setSelectedTags(parsedResponses.areas);
      }
      if (parsedResponses.hobbies) {
        setSelectedHobbies(parsedResponses.hobbies);
      }
    }
    
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step >= 0 && step < profileQuestions.length) {
        setCurrentStep(step);
      } else {
        setCurrentStep(0);
        localStorage.setItem('entrepreneurProfileStep', '0');
      }
    }
  }, [router]);
  
  const handleNext = async () => {
    const currentQuestion = profileQuestions[currentStep];
    const response = responses[currentQuestion.id];
    
    // Validation based on question type
    if (currentQuestion.type === 'tags' && (!selectedTags.length)) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, selecione pelo menos uma opção para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save to localStorage
      localStorage.setItem('entrepreneurProfile', JSON.stringify(responses));
      
      // Move to next question or finish
      if (currentStep < profileQuestions.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        localStorage.setItem('entrepreneurProfileStep', nextStep.toString());
      } else {
        handleFinish();
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar resposta",
        description: "Ocorreu um erro ao salvar sua resposta. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      localStorage.setItem('entrepreneurProfileStep', newStep.toString());
    }
  };
  
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      setResponses(prev => ({
        ...prev,
        areas: newTags
      }));
      
      return newTags;
    });
  };
  
  const handleSliderChange = (value: number[], questionId: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value[0]
    }));
  };
  
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };
  
  const handleHobbySelect = (hobbyId: string, hobbyLabel: string) => {
    setSelectedHobbies(prev => {
      const newHobbies = prev.includes(hobbyId)
        ? prev.filter(h => h !== hobbyId)
        : [...prev, hobbyId];
      
      setResponses(prev => ({
        ...prev,
        hobbies: newHobbies
      }));
      
      return newHobbies;
    });
  };
  
  const renderTreeNode = (node: TreeOption, level: number = 0) => {
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedHobbies.includes(node.id);
    
    return (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 py-1">
          {node.children && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleNode(node.id)}
            >
              {isExpanded ? '-' : '+'}
            </Button>
          )}
          <div
            className={`cursor-pointer px-2 py-1 rounded-md ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent/10'
            }`}
            onClick={() => handleHobbySelect(node.id, node.label)}
          >
            {node.label}
          </div>
        </div>
        {isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const handleFinish = async () => {
    setIsLoading(true);
    
    try {
      // Get recommendations based on profile
      const result = await api.getProfileRecommendations();
      setRecommendations(result.recommendations);
      
      // Update coins (add 100 for completing profile)
      if (userCoins) {
        const newCoins = userCoins + 100;
        setUserCoins(newCoins);
        
        // Save progress
        localStorage.setItem('profileCompleted', 'true');
      }
      
      toast({
        title: "Perfil concluído!",
        description: "Você ganhou 100 moedas por completar seu perfil.",
      });
      
      setShowRecommendations(true);
    } catch (error) {
      toast({
        title: "Erro ao processar perfil",
        description: "Ocorreu um erro ao processar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderQuestionForm = () => {
    const currentQuestion = profileQuestions[currentStep];
    
    switch (currentQuestion.type) {
      case 'tags':
        return (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => (
              <Badge
                key={option}
                variant={selectedTags.includes(option) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5"
                onClick={() => handleTagSelect(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        );
      
      case 'slider':
        return (
          <div className="space-y-6">
            <Slider
              defaultValue={[responses[currentQuestion.id] || currentQuestion.min || 0]}
              max={currentQuestion.max}
              min={currentQuestion.min}
              step={currentQuestion.step}
              onValueChange={(value) => handleSliderChange(value, currentQuestion.id)}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              {currentQuestion.marks?.map((mark) => (
                <span key={mark.value}>{mark.label}</span>
              ))}
            </div>
          </div>
        );
      
      case 'tree':
        return (
          <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4">
            {currentQuestion.treeOptions?.map(node => renderTreeNode(node))}
          </div>
        );
      
      case 'audience-tags':
        return (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => (
              <Badge
                key={option}
                variant={selectedTags.includes(option) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5"
                onClick={() => handleTagSelect(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const renderProgressSteps = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {profileQuestions.map((_, index) => (
            <div 
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index < currentStep 
                  ? 'bg-secondary text-secondary-foreground' 
                  : index === currentStep 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
            </div>
          ))}
        </div>
        <Progress 
          value={(currentStep / (profileQuestions.length - 1)) * 100} 
          className="h-1 mt-2" 
        />
      </div>
    );
  };
  
  if (showRecommendations) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h1 className="text-3xl font-bold">Perfil Concluído!</h1>
            <p className="text-muted-foreground mt-2">
              Com base nas suas respostas, identificamos alguns nichos que podem ser ideais para você.
            </p>
          </div>
          
          <div className="space-y-6 mb-8">
            {recommendations.map((rec, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Send className="h-5 w-5 mr-2 text-secondary" />
                        {rec.niche}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Potencial: <span className="font-semibold">{rec.potential}</span>
                      </CardDescription>
                    </div>
                    <Button variant="secondary" size="sm">
                      Explorar Este Nicho
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-card-foreground mb-4">{rec.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded-md">
                      <span className="block text-muted-foreground mb-1">Investimento Aproximado</span>
                      <span className="font-medium">{rec.investmentRange}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <span className="block text-muted-foreground mb-1">Tempo Necessário</span>
                      <span className="font-medium">{rec.timeCommitment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/pesquisa-nicho')}
            >
              Pesquisar Mais Nichos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Perfil Empreendedor</CardTitle>
            <CardDescription>
              Vamos ajudar você a encontrar o nicho ideal para seu negócio. Responda as perguntas abaixo
              para que possamos entender melhor o seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderProgressSteps()}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {profileQuestions[currentStep].question}
              </h2>
              <div className="mt-4">
                {renderQuestionForm()}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {currentStep === profileQuestions.length - 1 ? (
                <>
                  {isLoading ? 'Processando...' : 'Finalizar'}
                  {!isLoading && <Check className="ml-2 h-4 w-4" />}
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Dica</h3>
              <p className="text-sm text-muted-foreground">
                Selecione todas as opções que se aplicam ao seu perfil. Quanto mais informações você fornecer,
                melhores serão nossas recomendações.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}