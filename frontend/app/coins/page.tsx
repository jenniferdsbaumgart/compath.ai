'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Check, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

const coinPackages = [
  {
    id: 'coins-100',
    amount: 100,
    price: 9.90,
    popular: false,
    description: 'Ideal para começar suas pesquisas'
  },
  {
    id: 'coins-300',
    amount: 300,
    price: 24.90,
    popular: true,
    description: 'Melhor custo-benefício'
  },
  {
    id: 'coins-500',
    amount: 500,
    price: 39.90,
    popular: false,
    description: 'Para usuários frequentes'
  }
];

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.90,
    period: 'mês',
    features: [
      '10 pesquisas por mês',
      'Acesso a cursos básicos',
      'Suporte por email'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 49.90,
    period: 'mês',
    features: [
      '30 pesquisas por mês',
      'Acesso a todos os cursos',
      'Suporte prioritário',
      'Análise de concorrentes',
      'Relatórios detalhados'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 99.90,
    period: 'mês',
    features: [
      'Pesquisas ilimitadas',
      'Acesso completo à plataforma',
      'Suporte 24/7',
      'Consultoria mensal',
      'API de integração'
    ],
    popular: false
  }
];

export default function CoinsPage() {
  const [selectedTab, setSelectedTab] = useState<'coins' | 'subscription'>('coins');
  
  const handlePurchaseCoins = async (packageId: string) => {
    // TODO: Implementar Stripe checkout
  };
  
  const handleSubscribe = async (planId: string) => {
    // TODO: Implementar Stripe subscription  
  };
  
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-3xl font-bold">Compre Moedas ou Assine um Plano</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
            Escolha a melhor opção para você: compre pacotes de moedas para usar quando quiser
            ou assine um plano com pesquisas mensais incluídas.
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800">
            <button
              className={`px-4 py-2 rounded-l-lg ${
                selectedTab === 'coins'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              onClick={() => setSelectedTab('coins')}
            >
              Comprar Moedas
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg ${
                selectedTab === 'subscription'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              onClick={() => setSelectedTab('subscription')}
            >
              Assinar Plano
            </button>
          </div>
        </div>
        
        {selectedTab === 'coins' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coinPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative ${
                  pkg.popular ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pkg.amount} moedas</span>
                    <Coins className="h-5 w-5 text-amber-500" />
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <span className="text-3xl font-bold">R$ {pkg.price.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchaseCoins(pkg.id)}
                  >
                    Comprar Agora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                      <span className="ml-1 text-gray-500">/{plan.period}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    Assinar Agora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer/>
      </div>
    </>
  );
}