'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CoinDisplay } from '@/components/ui/coin-display';
import { 
  Search, 
  Compass, 
  TrendingUp, 
  Users, 
  PlusCircle,
  AlertCircle,
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  LineChart,
  CheckCircle,
  TrendingDown,
  UserPlus
} from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

export default function PesquisaNichoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userCoins, setUserCoins] = useState(200);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [researchCost, setResearchCost] = useState(30); // Cost in coins for research
  
  // Mock research results
  const [researchResults, setResearchResults] = useState({
    marketSize: 'Médio (R$ 500 milhões - R$ 1 bilhão)',
    growthRate: '12% ao ano',
    competitionLevel: 'Moderado',
    entryBarriers: 'Médias',
    targetAudience: 'Profissionais de 25-45 anos em áreas urbanas',
    keyPlayers: [
      { name: 'TechLearn', marketShare: '22%' },
      { name: 'EduSkills', marketShare: '18%' },
      { name: 'ProCourses', marketShare: '15%' },
    ],
    opportunities: [
      'Foco em nichos específicos como programação para iniciantes',
      'Cursos com certificações reconhecidas pelo mercado',
      'Parcerias com empresas para contratação de alunos'
    ],
    challenges: [
      'Alto custo de aquisição de clientes',
      'Necessidade de atualização constante de conteúdo',
      'Concorrência com plataformas gratuitas'
    ],
    recommendations: [
      'Desenvolver um posicionamento de marca claro e diferenciado',
      'Focar em experiência do usuário e acompanhamento personalizado',
      'Criar conteúdo gratuito para atrair clientes potenciais'
    ]
  });
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserCoins(currentUser.coins);
    }
  }, [router]);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite o que você deseja pesquisar.",
        variant: "destructive",
      });
      return;
    }
    
    // if (userCoins < researchCost) {
    if (userCoins < 0) {
      toast({
        title: "Moedas insuficientes",
        description: `Você precisa de ${researchCost} moedas para realizar esta pesquisa.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call and deduct coins
    setTimeout(() => {
      const newCoins = userCoins - researchCost;
      setUserCoins(newCoins);
      
      // Save updated coins to localStorage or user profile
      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, coins: newCoins }));
      }
      
      toast({
        title: "Pesquisa concluída!",
        description: `Você gastou ${researchCost} moedas nesta pesquisa.`,
      });
      
      // Redirect to results page with query and results
      const params = new URLSearchParams({
        searchQuery,
        researchResults: JSON.stringify(researchResults),
        userCoins: newCoins.toString(),
      }).toString();
      router.push(`/pesquisa-nicho/resultados?${params}`);
      
      setIsSearching(false);
    }, 2000);
  };
  
  const handleNewSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };
  
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesquisa de Nicho</h1>
            <p className="text-gray-600 mt-1">
              Encontre oportunidades de mercado e analise a concorrência
            </p>
          </div>
          <CoinDisplay coins={userCoins} className="mt-4 sm:mt-0" />
        </div>
        
        {!showResults ? (
          <Card>
            <CardHeader>
              <CardTitle>O que você deseja pesquisar?</CardTitle>
              <CardDescription>
                Descreva o nicho, mercado ou ideia de negócio que você gostaria de explorar. 
                Nossa IA analisará os dados disponíveis e fornecerá insights valiosos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex flex-col space-y-4">
                  <Input
                    placeholder="Ex: Cursos online de programação, Loja de produtos sustentáveis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery('Cursos online para profissionais')}
                    >
                      Cursos online
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery('E-commerce de produtos sustentáveis')}
                    >
                      Produtos sustentáveis
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery('Serviço de consultoria para pequenas empresas')}
                    >
                      Consultoria
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery('Aplicativo de produtividade para freelancers')}
                    >
                      App de produtividade
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>Custo da pesquisa</AlertTitle>
                <AlertDescription>
                  Esta pesquisa custará <strong>{researchCost} moedas</strong>. Você receberá uma análise completa do nicho
                  ou mercado, incluindo tamanho de mercado, concorrentes, oportunidades e recomendações.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="flex items-center"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pesquisando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Pesquisar ({researchCost} moedas)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Research Results
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-primary/70 font-medium uppercase tracking-wider">Resultado da Pesquisa</span>
                    <CardTitle className="mt-1">{searchQuery}</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNewSearch}>
                    Nova Pesquisa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-secondary" />
                      Tamanho do Mercado
                    </h3>
                    <p className="font-medium text-gray-900">{researchResults.marketSize}</p>
                    <p className="text-sm text-gray-600 mt-1">Taxa de crescimento: {researchResults.growthRate}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <LineChart className="h-4 w-4 mr-1 text-primary" />
                      Nível de Competição
                    </h3>
                    <p className="font-medium text-gray-900">{researchResults.competitionLevel}</p>
                    <p className="text-sm text-gray-600 mt-1">Barreiras de entrada: {researchResults.entryBarriers}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-1 text-accent" />
                    Público-Alvo
                  </h3>
                  <p className="text-gray-900">{researchResults.targetAudience}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <UserPlus className="h-4 w-4 mr-1 text-success" />
                    Principais Jogadores
                  </h3>
                  <ul className="list-disc pl-6">
                    {researchResults.keyPlayers.map((player, index) => (
                      <li key={index}>
                        <span className="font-medium">{player.name}</span> - {player.marketShare} de participação no mercado
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1 text-danger" />
                    Oportunidades
                  </h3>
                  <ul className="list-disc pl-6">
                    {researchResults.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-gray-900">{opportunity}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-warning" />
                    Desafios
                  </h3>
                  <ul className="list-disc pl-6">
                    {researchResults.challenges.map((challenge, index) => (
                      <li key={index} className="text-gray-900">{challenge}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-success" />
                    Recomendações
                  </h3>
                  <ul className="list-disc pl-6">
                    {researchResults.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-900">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
    </>
  );
}
