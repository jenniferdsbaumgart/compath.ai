import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ArrowRight, Users, BookOpen, Lightbulb, BarChart } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="w-full py-5 px-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/logo-full-blue.svg" alt="Compath Logo" width={170} height={30} />
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-secondary/40 to-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-2/3 mb-10 md:mb-0 animate-slideInUp">
                <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
                  Encontre seu <span className="text-teal-500">caminho</span> como empreendedor
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  O <span className="text-teal-500 font-bold">Compath</span> é uma plataforma inteligente que utiliza IA para ajudar empreendedores a identificar nichos de mercado, analisar concorrência e encontrar oportunidades de negócio.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Começar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Já tenho uma conta
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <Image src="/compath-hero.png" alt="hero image"width={600} height={400} className='rounded-lg'/>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Como o Compath pode te ajudar</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Nossa plataforma combina inteligência artificial e pesquisa de mercado para ajudar você a tomar decisões mais inteligentes sobre seu negócio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Compass className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Encontre seu nicho</h3>
                <p className="text-gray-600">
                  Nossa IA ajuda você a identificar oportunidades de mercado alinhadas com seus interesses e habilidades.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise de concorrência</h3>
                <p className="text-gray-600">
                  Entenda o cenário competitivo e posicione seu negócio estrategicamente no mercado.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Identifique clientes</h3>
                <p className="text-gray-600">
                  Descubra quem são seus clientes ideais e como alcançá-los de forma eficiente.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ideias personalizadas</h3>
                <p className="text-gray-600">
                  Receba sugestões de negócios baseadas no seu perfil, orçamento e disponibilidade.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cursos e conteúdos</h3>
                <p className="text-gray-600">
                  Acesse materiais educativos e cursos para aprender a estruturar e crescer seu negócio.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Suporte contínuo</h3>
                <p className="text-gray-600">
                  Acompanhamento e orientação durante todo o seu percurso empreendedor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar sua jornada?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empreendedores que estão descobrindo novos caminhos para seus negócios com o Compath.
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}