'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Shield, Moon, Sun, Smartphone } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      };
      
      toast({
        title: "Configuração atualizada",
        description: `A configuração foi ${newSettings[setting] ? 'ativada' : 'desativada'}.`,
      });
      
      return newSettings;
    });
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do Compath
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-gray-500">
                      Escolha entre tema claro ou escuro
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Gerencie como você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-gray-500">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleSettingChange('emailNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-gray-500">
                      Receba notificações em tempo real
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleSettingChange('pushNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Emails de Marketing</p>
                    <p className="text-sm text-gray-500">
                      Receba novidades e promoções
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={() => handleSettingChange('marketingEmails')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Alertas de Segurança</p>
                    <p className="text-sm text-gray-500">
                      Seja notificado sobre atividades suspeitas
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={() => handleSettingChange('securityAlerts')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Autenticação em Dois Fatores</p>
                    <p className="text-sm text-gray-500">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={() => handleSettingChange('twoFactorAuth')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados da Conta</CardTitle>
              <CardDescription>
                Gerencie seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Exportar Dados
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50">
                Excluir Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer/>
    </>
  );
}