'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CoinDisplay } from '@/components/ui/coin-display';
import { 
  Search, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { isAuthenticated, getCurrentUser, getUserCoins } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { useProtectedRoute } from '@/hooks/protected-route';
import { saveAiReport } from '@/lib/api';

export default function PesquisaNichoPage() {
  const router = useRouter();
  useProtectedRoute();
  const { toast } = useToast();

  const [userCoins, setUserCoins] = useState(getUserCoins());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const researchCost = 30;

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite o que você deseja pesquisar.",
        variant: "destructive",
      });
      return;
    }
  
    if (userCoins < researchCost) {
      toast({
        title: "Moedas insuficientes",
        description: `Você precisa de ${researchCost} moedas para realizar esta pesquisa.`,
        variant: "destructive",
      });
      return;
    }
  
    setIsSearching(true);
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: searchQuery }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao gerar relatório:', errorData);
        throw new Error(errorData.message || 'Erro desconhecido');
      }
  
      const text = await response.text();
      console.log('Texto bruto recebido:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ Erro ao fazer JSON.parse do retorno:", e);
        toast({
          title: 'Erro de leitura',
          description: 'A resposta do servidor não estava no formato esperado.',
          variant: 'destructive',
        });
        return;
      }
      console.log('Relatório recebido:', data);
  
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado.');
      }
  
      const savedReport = await saveAiReport({
        userId: currentUser.id,
        searchQuery,
        report: data.report,
      });
  
      toast({
        title: "Pesquisa concluída!",
        description: `Você gastou ${researchCost} moedas nesta pesquisa.`,
      });
  
      const newCoins = userCoins - researchCost;
      setUserCoins(newCoins);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ ...currentUser, coins: newCoins })
      );
  
      // Redireciona para a página de resultados com o ID do relatório
      router.push(`/pesquisa-nicho/resultados?id=${savedReport.id}`);
  
    } catch (err: any) {
      console.error('Erro no handleSearch:', err);
      toast({
        title: 'Erro ao gerar relatório',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
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
                <Input
                  placeholder="Ex: Barbearia em Blumenau, Loja de roupa alternativa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Cursos online', 'Produtos sustentáveis', 'Consultoria', 'App de produtividade'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>Custo da pesquisa</AlertTitle>
                <AlertDescription>
                  Esta pesquisa custará <strong>{researchCost} moedas</strong>.
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
        </main>
        <Footer />
      </div>
    </>
  );
}
