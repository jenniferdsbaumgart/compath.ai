"use client";
import Image from 'next/image'
import { useTheme } from 'next-themes';

export function Footer() {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/logo-full-white.svg' : '/logo-full-blue.svg';

  return (
    <footer className="bg-secondary/10 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image src={logoSrc} alt="Compath Logo" width={170} height={30} />
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary">
              Sobre nós
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              Termos
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              Privacidade
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              Contato
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Compath. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
