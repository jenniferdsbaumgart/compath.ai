"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Building, Globe } from "lucide-react";
import { getCurrentUser, isAuthenticated, getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null); // Use 'any' temporarily; update if api.ts typing is confirmed
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    website: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching user data for ID:", id);
      console.log("Token:", getToken() || "No token");
      const response = await api.getUserById(id as string);
      console.log("Fetched user data:", response);
      setUser(response.user);
      setFormData({
        name: response.user.name || "",
        email: response.user.email || "",
        phone: response.user.phone || "",
        location: response.user.location || "",
        company: response.user.company || "",
        website: response.user.website || "",
        bio: response.user.bio || "",
      });
      localStorage.setItem(
        "compath_user",
        JSON.stringify({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          coins: response.user.coins,
          phone: response.user.phone || "",
          location: response.user.location || "",
          company: response.user.company || "",
          website: response.user.website || "",
          bio: response.user.bio || "",
        })
      );
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      const errorMessage = error.message.includes("401")
        ? "Sessão expirada. Faça login novamente."
        : error.message.includes("404")
        ? "Usuário não encontrado."
        : error.message || "Não foi possível carregar os dados do perfil.";
      toast({
        title: "Erro ao carregar perfil",
        description: errorMessage,
        variant: "destructive",
      });
      if (error.message.includes("401")) {
        localStorage.removeItem("compath_user");
        router.push("/login");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Profile page useEffect triggered, ID:", id);
    if (!isAuthenticated()) {
      console.log("Not authenticated, redirecting to login");
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      router.push("/login");
      setIsLoading(false);
      return;
    }

    const currentUser = getCurrentUser();
    console.log("Current user from localStorage:", currentUser);
    if (!currentUser || !currentUser.id) {
      console.log(
        "No current user or ID in localStorage, redirecting to login"
      );
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado no armazenamento local.",
        variant: "destructive",
      });
      router.push("/login");
      setIsLoading(false);
      return;
    }

    if (currentUser.id !== id) {
      console.log(
        "ID mismatch. Current user ID:",
        currentUser.id,
        "URL ID:",
        id
      );
      toast({
        title: "Acesso não autorizado",
        description: `Você só pode visualizar seu próprio perfil. Redirecionando...`,
        variant: "destructive",
      });
      router.push(`/profile/${currentUser.id}`);
      return;
    }

    fetchUserData();
  }, [router, toast, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: any = {};
      if (formData.name && formData.name !== user.name)
        updateData.name = formData.name;
      if (formData.email && formData.email !== user.email)
        updateData.email = formData.email;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.location !== user.location)
        updateData.location = formData.location;
      if (formData.company !== user.company)
        updateData.company = formData.company;
      if (formData.website !== user.website)
        updateData.website = formData.website;
      if (formData.bio !== user.bio) updateData.bio = formData.bio;

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum campo foi alterado.",
        });
        setIsEditing(false);
        return;
      }

      console.log("Updating user with data:", updateData);
      const response = await api.updateUser(user.id, updateData);
      console.log("Profile update response:", response);

      setUser(response.user);
      localStorage.setItem(
        "compath_user",
        JSON.stringify({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          coins: response.user.coins,
          phone: response.user.phone || "",
          location: response.user.location || "",
          company: response.user.company || "",
          website: response.user.website || "",
          bio: response.user.bio || "",
        })
      );

      await fetchUserData();

      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Erro ao atualizar",
        description:
          error.message || "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-white">
                Erro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Não foi possível carregar o perfil. Tente novamente.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="mt-4 bg-blue-900 text-white hover:bg-blue-800"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-white">
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-gray-600 dark:text-white">
                    {user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900 dark:text-white">
                    Informações Pessoais
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-blue-900 text-blue-900 hover:bg-blue-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Nome
                    </Label>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Email
                    </Label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Telefone
                    </Label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Localização
                    </Label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Empresa
                    </Label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Website
                    </Label>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="bio"
                      className="text-gray-700 dark:text-gray-200"
                    >
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      rows={4}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || "",
                          location: user.location || "",
                          company: user.company || "",
                          website: user.website || "",
                          bio: user.bio || "",
                        });
                      }}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-900 text-white hover:bg-blue-800"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
