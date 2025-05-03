'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, ArrowRight, ArrowLeft, Sparkles, Send } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

// Types
type ProfileQuestion = {
  id: string;
  question: string;
  type: 'select' | 'text' | 'radio' | 'textarea';
  options?: string[];
  placeholder?: string;
};

type ProfileResponse = {
  [key: string]: any;
};

// Define questions
const profileQuestions: ProfileQuestion[] = [
  {
    id: 'area',
    question: 'Qual área de negócio mais te interessa?',
    type: 'select',
    options: ['Tecnologia', 'Saúde', 'Moda', 'Educação', 'Sustentabilidade', 'Não sei ainda', 'Outro'],
  },
  {
    id: 'budget',
    question: 'Quanto você está disposto a investir no seu novo negócio?',
    type: 'select',
    options: ['R$500', 'R$1.000', 'R$5.000', 'R$10.000', 'Não sei ainda', 'Não é importante neste momento'],
  },
  {
    id: 'time',
    question: 'Quantas horas por semana você pode dedicar ao seu novo negócio?',
    type: 'select',
    options: ['5 horas', '10 horas', '20 horas', '40 horas', 'Não sei ainda', 'Não é importante neste momento'],
  },
  {
    id: 'hobbies',
    question: 'Fale um pouco sobre seus hobbies e interesses. O que você mais gosta de fazer?',
    type: 'textarea',
    placeholder: 'Descreva seus hobbies e interesses...',
  },
  {
    id: 'audience',
    question: 'Quem você gostaria de atingir com o seu produto ou serviço? Pode ser um público específico ou mais amplo.',
    type: 'textarea',
    placeholder: 'Descreva seu público-alvo...',
  },
  {
    id: 'experience',
    question: 'Você já tem alguma experiência como empreendedor?',
    type: 'radio',
    options: ['Sim, já tive um negócio antes', 'Sim, mas informal/pequenos projetos', 'Não, é a primeira vez', 'Não sei'],
  },
  {
    id: 'additional',
    question: 'Existe alguma outra informação ou preferência que você gostaria de compartilhar conosco?',
    type: 'textarea',
    placeholder: 'Informações adicionais...',
  }
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
      setResponses(JSON.parse(savedResponses));
    }
    
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      // Ensure the step is within valid bounds
      if (step >= 0 && step < profileQuestions.length) {
        setCurrentStep(step);
      } else {
        // Reset to 0 if saved step is invalid
        setCurrentStep(0);
        localStorage.setItem('entrepreneurProfileStep', '0');
      }
    }
  }, [router]);
  
  const handleNext = async () => {
    const currentQuestion = profileQuestions[currentStep];
    const response = responses[currentQuestion.id];
    
    // Skip validation for "Não sei ainda" or empty responses in textarea
    if (!response && currentQuestion.type !== 'textarea') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione uma opção para continuar.",
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
  
  const handleChange = (questionId: string, value: any) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    setResponses(newResponses);
    localStorage.setItem('entrepreneurProfile', JSON.stringify(newResponses));
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
    // Ensure currentStep is within bounds
    if (currentStep < 0 || currentStep >= profileQuestions.length) {
      setCurrentStep(0);
      return null;
    }

    const currentQuestion = profileQuestions[currentStep];
    
    switch (currentQuestion.type) {
      case 'select':
        return (
          <Select
            value={responses[currentQuestion.id] || ''}
            onValueChange={(value: any) => handleChange(currentQuestion.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={currentQuestion.placeholder}
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
            className="min-h-[120px]"
          />
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={(value: any) => handleChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return (
          <Input
            placeholder={currentQuestion.placeholder}
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
          />
        );
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
                  ? 'bg-secondary text-white' 
                  : index === currentStep 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-200 text-gray-500'
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil Concluído!</h1>
            <p className="text-gray-600 mt-2">
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
                        <Sparkles className="h-5 w-5 mr-2 text-secondary" />
                        {rec.niche}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-primary/90">
                        Potencial: <span className="font-semibold">{rec.potential}</span>
                      </CardDescription>
                    </div>
                    <Button variant="secondary" size="sm">
                      Explorar Este Nicho
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="block text-gray-500 mb-1">Investimento Aproximado</span>
                      <span className="font-medium">{rec.investmentRange}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="block text-gray-500 mb-1">Tempo Necessário</span>
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
        
        <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
          <div className="flex items-start">
            <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
              <Send className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Dica</h3>
              <p className="text-sm text-gray-600">
                Não se preocupe se não souber responder alguma pergunta. Você sempre pode selecionar <i>Não sei ainda</i> ou deixar o campo em branco.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
      </div>
    </>
  );
}