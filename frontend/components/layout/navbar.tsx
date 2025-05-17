"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Compass,
  Lightbulb,
  BookOpen,
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinDisplay } from "@/components/ui/coin-display";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    coins: number;
    email: string;
    avatar?: string;
  } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
        coins: currentUser.coins,
        avatar: currentUser.avatar,
      });
    }
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="bg-secondary/5 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo-full-blue.svg" alt="Compath Logo" width={170} height={30} />
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "text-white bg-primary"
                      : "text-foreground hover:bg-accent/10"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/perfil-empreendedor"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/perfil-empreendedor"
                      ? "text-white bg-primary"
                      : "text-foreground hover:bg-accent/10"
                  }`}
                >
                  Perfil Empreendedor
                </Link>
                <Link
                  href="/pesquisa-nicho"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/pesquisa-nicho"
                      ? "text-white bg-primary"
                      : "text-foreground hover:bg-accent/10"
                  }`}
                >
                  Pesquisar Nichos
                </Link>
                <Link
                  href="/cursos"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/cursos"
                      ? "text-white bg-primary"
                      : "text-foreground hover:bg-accent/10"
                  }`}
                >
                  Cursos
                </Link>

                <div className="ml-4 flex items-center space-x-4">
                  <Link href="/coins">
                    <CoinDisplay coins={user.coins} animate={true} />
                  </Link>

                  <ThemeToggle />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <Link href="/profile" passHref>
                          <DropdownMenuItem asChild>
                            <div>
                              <User className="mr-2 h-4 w-4" />
                              <span>Perfil</span>
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/payments" passHref>
                          <DropdownMenuItem asChild>
                            <div>
                              <CreditCard className="mr-2 h-4 w-4" />
                              <span>Pagamentos</span>
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/settings" passHref>
                          <DropdownMenuItem asChild>
                            <div>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Configurações</span>
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/help" passHref>
                          <DropdownMenuItem asChild>
                            <div>
                              <HelpCircle className="mr-2 h-4 w-4" />
                              <span>Ajuda</span>
                            </div>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}

            {!user && (
              <>
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden space-x-4">
            <ThemeToggle />
            {user && <CoinDisplay coins={user.coins} className="mr-4" />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Abrir menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <div
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/dashboard"
                        ? "text-white bg-primary"
                        : "text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <Lightbulb size={18} className="mr-2" />
                      Dashboard
                    </div>
                  </div>
                </Link>
                <Link href="/perfil-empreendedor">
                  <div
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/perfil-empreendedor"
                        ? "text-white bg-primary"
                        : "text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <User size={18} className="mr-2" />
                      Perfil Empreendedor
                    </div>
                  </div>
                </Link>
                <Link href="/pesquisa-nicho">
                  <div
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/pesquisa-nicho"
                        ? "text-white bg-primary"
                        : "text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <Compass size={18} className="mr-2" />
                      Pesquisar Nichos
                    </div>
                  </div>
                </Link>
                <Link href="/cursos">
                  <div
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === "/cursos"
                        ? "text-white bg-primary"
                        : "text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <BookOpen size={18} className="mr-2" />
                      Cursos
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/10"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/10">
                    Entrar
                  </div>
                </Link>
                <Link href="/register">
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90">
                    Cadastrar
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
