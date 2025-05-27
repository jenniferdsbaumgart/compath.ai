'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, User, Award, PlusCircle, ArrowRight, Users, Share2, Gift, PieChart, Star, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CoinDisplay } from '@/components/ui/coin-display';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

interface DashboardMetrics {
  coins: number;
  searchCount: number;
  activeCourses: Array<{
    id: string;
    title: string;
    description: string;
    coinCost?: number;
    duration?: string;
    category?: string;
  }>;
  totalUsers: number;
  totalCourses: number;
  totalSearches: number;
  profileCompletion?: number;
  userActivity: {
    invitedFriends: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; coins: number } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validação de autenticação e carregamento dos dados do dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = isAuthenticated();

      if (!isAuth) {
        router.push('/login');
        return;
      }

      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const [userCoins, dashboardResponse] = await Promise.all([
            api.getUserCoins(),
            api.getDashboardData(currentUser.id),
          ]);
          setUser({
            name: currentUser.name,
            coins: userCoins.coins,
          });
          setDashboardData(dashboardResponse.metrics);
        } else {
          router.push('/login');
        }
      } catch (error) {
        toast({
          title: 'Erro ao carregar dados do dashboard',
          description: 'Não foi possível carregar os dados. Tente novamente.',
          variant: 'destructive',
        });
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(() => checkAuth(), 500);
  }, [router, toast]);

  const handleInviteFriend = async () => {
    if (user) {
      try {
        const { coins } = await api.earnCoins(50);
        setUser({ ...user, coins });
        setDashboardData((prev) =>
          prev ? { ...prev, userActivity: { ...prev.userActivity, invitedFriends: prev.userActivity.invitedFriends + 1 } } : prev
        );
        toast({
          title: 'Moedas ganhas!',
          description: 'Você ganhou 50 moedas por convidar um amigo.',
        });
      } catch (error) {
        toast({
          title: 'Erro ao ganhar moedas',
          description: 'Não foi possível adicionar moedas. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading || !user || !dashboardData) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {user.name}!</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Bem-vindo ao seu dashboard da plataforma Compath</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <CoinDisplay coins={user.coins} animate={true} />
              <Button onClick={handleInviteFriend} size="sm" className="flex items-center">
                <Gift className="mr-1.5 h-4 w-4" />
                Ganhar moedas
              </Button>
            </div>
          </div>
        </section>

        {/* Profile completion card */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Complete seu perfil empreendedor</span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {dashboardData.profileCompletion ?? 0}% completo
                </span>
              </CardTitle>
              <CardDescription>
                Responda algumas perguntas para que possamos recomendar os melhores nichos para você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={dashboardData.profileCompletion ?? 0} className="h-2 mb-4" />
              <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-1.5 text-secondary" />
                  <span className="dark:text-gray-400">Ganhe 100 moedas ao completar seu perfil</span>
                </div>
                <Link href="/perfil-empreendedor">
                  <Button className="mt-4 sm:mt-0">
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick actions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-300">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/perfil-empreendedor">
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <User className="h-5 w-5 mr-2 text-secondary" />
                    Completar Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete seu perfil para receber recomendações personalizadas.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pesquisa-nicho">
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Compass className="h-5 w-5 mr-2 text-accent" />
                    Pesquisar Nichos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Descubra oportunidades de mercado para seu negócio.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cursos">
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Explorar Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Veja suas pesquisas favoritas salvas para acessar rapidamente oportunidades de nicho.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Ways to earn coins */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-300">Ganhe Moedas</h2>
          <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-6 border border-secondary/20">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Formas de ganhar moedas:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm flex items-start">
                <div className="bg-secondary/20 rounded-full p-2 mr-3">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-300">Complete seu perfil</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ganhe 100 moedas ao completar seu perfil empreendedor.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm flex items-start">
                <div className="bg-accent/20 rounded-full p-2 mr-3">
                  <Share2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-300">Convide amigos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ganhe 50 moedas para cada amigo que se cadastrar.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm flex items-start">
                <div className="bg-primary/20 rounded-full p-2 mr-3">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-300">Complete pesquisas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ganhe até 30 moedas respondendo pesquisas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleInviteFriend} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Convidar Amigos
              </Button>
            </div>
          </div>
        </section>

        {/* Stats summary */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-300">Resumo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Moedas Disponíveis</p>
                  <p className="text-2xl font-bold">{dashboardData.coins}</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Perfil Completado</p>
                  <p className="text-2xl font-bold">{dashboardData.profileCompletion ?? 0}%</p>
                </div>
                <div className="p-2 bg-secondary/10 rounded-full">
                  <User className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Pesquisas Realizadas</p>
                  <p className="text-2xl font-bold">{dashboardData.searchCount}</p>
                </div>
                <div className="p-2 bg-accent/10 rounded-full">
                  <Compass className="h-5 w-5 text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Amigos Convidados</p>
                  <p className="text-2xl font-bold">{dashboardData.userActivity.invitedFriends}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Courses */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Cursos Ativos</h3>
            {dashboardData.activeCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.activeCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.category ?? 'Sem categoria'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
                      <p className="text-sm mt-2">
                        Custo: {course.coinCost !== undefined ? `${course.coinCost} moedas` : 'Gratuito'}
                      </p>
                      {course.duration && <p className="text-sm">Duração: {course.duration}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum curso ativo no momento.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}