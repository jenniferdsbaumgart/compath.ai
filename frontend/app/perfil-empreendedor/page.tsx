"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  Atom,
  Microscope,
  BookUser,
  BriefcaseBusiness,
  Cpu,
  GraduationCap,
  Handshake,
  LetterText,
  Omega,
  Scale,
  Stethoscope,
  TreePine,
  Bike,
  Brain,
  Mic,
  WandSparkles,
  CodeXml,
  Database,
  MessageSquareCode,
  PanelsTopLeft,
  TabletSmartphone,
  Gamepad2,
  Joystick,
  FolderCode,
  FolderOutput,
  Wifi,
  SquareActivity,
  Dumbbell,
  PersonStanding,
  BicepsFlexed,
  Apple,
  Sprout,
  Leaf,
  FileText,
  Palette,
  Brush,
  Layout,
  Camera,
  Monitor,
  Music,
  Speaker,
  BookOpen,
  Book,
  Edit,
  Feather,
  Sunrise,
  MapPin,
  Backpack,
  Car,
  Globe,
  Hammer,
  CookingPot,
  PawPrint,
  Dog,
  Cat,
  Briefcase,
  Coffee,
  DollarSign,
  Megaphone,
  UserCheck,
  Guitar,
  Activity,
  Award,
  ChefHat,
  Beer,
  Cake,
  Croissant,
  FlaskConical,
  GlassWater,
  Heart,
  Package,
  Pizza,
  Store,
  Truck,
  Utensils,
  Wheat,
} from "lucide-react";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { GiDeliveryDrone, GiLotus } from "react-icons/gi";
import { FaDumbbell, FaMicrochip, FaRunning, FaSeedling } from "react-icons/fa";
import { VscSnake } from "react-icons/vsc";
import { RiMentalHealthLine } from "react-icons/ri";
import { GiBrazil, GiSushis } from "react-icons/gi";
import { TbMeat } from "react-icons/tb";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import { Home } from "lucide-react";

// Types
type ProfileQuestion = {
  id: string;
  question: string;
  type: "tags" | "slider" | "tree" | "audience-tags";
  options?: (string | { label: string; icon?: JSX.Element })[];
  min?: number;
  max?: number;
  step?: number;
  marks?: { value: number; label: string }[];
  treeOptions?: TreeOption[];
};

type TreeOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeOption[];
};

type ProfileResponse = {
  [key: string]: any;
};

// Business areas tree structure
const businessAreas = [
  "Tecnologia",
  "Saúde e Bem-estar",
  "Educação",
  "E-commerce",
  "Serviços Profissionais",
  "Alimentação",
  "Moda e Beleza",
  "Sustentabilidade",
  "Finanças",
  "Entretenimento",
  "Pets",
  "Esportes",
];

const educationLevels = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Ensino Superior",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
  "Técnico",
  "Cursos Livres",
];

const educationAreas = [
  {
    label: "Ciências Exatas",
    icon: <Atom className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Ciências Biológicas",
    icon: <Microscope className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Ciências da Saúde",
    icon: <Stethoscope className="h-3 w-3 text-green-500" />,
  },
  { label: "Engenharias", icon: <Omega className="h-3 w-3 text-green-500" /> },
  {
    label: "Tecnologia da Informação",
    icon: <Cpu className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Ciências Humanas",
    icon: <BookUser className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Educação",
    icon: <GraduationCap className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Ciências Sociais Aplicadas",
    icon: <Handshake className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Linguística, Letras e Artes",
    icon: <LetterText className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Negócios e Administração",
    icon: <BriefcaseBusiness className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Meio Ambiente e Sustentabilidade",
    icon: <TreePine className="h-3 w-3 text-green-500" />,
  },
  { label: "Direito", icon: <Scale className="h-3 w-3 text-green-500" /> },
  {
    label: "Comunicação e Mídias",
    icon: <Mic className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Design e Artes Visuais",
    icon: <WandSparkles className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Psicologia e Comportamento",
    icon: <Brain className="h-3 w-3 text-green-500" />,
  },
  {
    label: "Esportes e Educação Física",
    icon: <Bike className="h-3 w-3 text-green-500" />,
  },
];

// Hobbies and interests tree
const hobbiesTree: TreeOption[] = [
  {
    id: "tech",
    icon: <Cpu className="h-5 w-5" />,
    label: "Tecnologia",
    children: [
      {
        id: "programming",
        icon: <CodeXml className="h-4 w-4 " />,
        label: "Programação",
        children: [
          {
            id: "web",
            icon: <PanelsTopLeft className="h-3 w-3 " />,
            label: "Desenvolvimento Web",
          },
          {
            id: "mobile",
            icon: <TabletSmartphone className="h-3 w-3 " />,
            label: "Apps Mobile",
          },
          {
            id: "ai",
            icon: <MessageSquareCode className="h-3 w-3 " />,
            label: "Inteligência Artificial",
          },
          {
            id: "datasci",
            icon: <Database className="h-3 w-3 " />,
            label: "Ciência de Dados",
          },
        ],
      },
      {
        id: "gaming",
        icon: <Joystick className="h-4 w-4 " />,
        label: "Games",
        children: [
          {
            id: "esports",
            icon: <Gamepad2 className="h-3 w-3 " />,
            label: "E-Sports",
          },
          {
            id: "gamedev",
            icon: <FolderCode className="h-3 w-3 " />,
            label: "Desenvolvimento de Jogos",
          },
          {
            id: "retro",
            icon: <FolderOutput className="h-3 w-3 " />,
            label: "Jogos Retrô",
          },
        ],
      },
      {
        id: "gadgets",
        icon: <FaMicrochip className="h-4 w-4 " />,
        label: "Gadgets e Invenções",
        children: [
          {
            id: "drones",
            icon: <GiDeliveryDrone className="h-3 w-3 " />,
            label: "Drones",
          },
          {
            id: "iot",
            icon: <Wifi className="h-3 w-3 " />,
            label: "Internet das Coisas (IoT)",
          },
        ],
      },
    ],
  },
  {
    id: "health",
    icon: <SquareActivity className="h-5 w-5 " />,
    label: "Saúde e Bem-estar",
    children: [
      {
        id: "fitness",
        icon: <Dumbbell className="h-4 w-4 " />,
        label: "Fitness",
        children: [
          {
            id: "yoga",
            icon: <PersonStanding className="h-3 w-3 " />,
            label: "Yoga",
          },
          {
            id: "crossfit",
            icon: <FaDumbbell className="h-3 w-3 " />,
            label: "CrossFit",
          },
          {
            id: "running",
            icon: <FaRunning className="h-3 w-3 " />,
            label: "Corrida",
          },
          {
            id: "gym",
            icon: <BicepsFlexed className="h-3 w-3 " />,
            label: "Musculação",
          },
        ],
      },
      {
        id: "nutrition",
        icon: <Apple className="h-4 w-4 " />,
        label: "Nutrição",
        children: [
          {
            id: "vegan",
            icon: <Sprout className="h-3 w-3 " />,
            label: "Veganismo",
          },
          {
            id: "organic",
            icon: <Leaf className="h-3 w-3 " />,
            label: "Alimentação Orgânica",
          },
          {
            id: "lowcarb",
            icon: <TbMeat className="h-3 w-3 " />,
            label: "Dieta Low Carb",
          },
        ],
      },
      {
        id: "mental-health",
        icon: <RiMentalHealthLine className="h-4 w-4 " />,
        label: "Saúde Mental",
        children: [
          {
            id: "meditation",
            icon: <GiLotus className="h-3 w-3 " />,
            label: "Meditação",
          },
          {
            id: "journaling",
            icon: <FileText className="h-3 w-3 " />,
            label: "Escrita Terapêutica",
          },
        ],
      },
    ],
  },
  {
    id: "arts",
    icon: <Palette className="h-5 w-5 " />,
    label: "Artes e Cultura",
    children: [
      {
        id: "visual-arts",
        icon: <Monitor className="h-4 w-4 " />,
        label: "Artes Visuais",
        children: [
          {
            id: "painting",
            icon: <Brush className="h-3 w-3 " />,
            label: "Pintura",
          },
          {
            id: "photography",
            icon: <Camera className="h-3 w-3 " />,
            label: "Fotografia",
          },
          {
            id: "design",
            icon: <Layout className="h-3 w-3 " />,
            label: "Design",
          },
        ],
      },
      {
        id: "music",
        icon: <Music className="h-4 w-4 " />,
        label: "Música",
        children: [
          {
            id: "instruments",
            icon: <Guitar className="h-3 w-3 " />,
            label: "Instrumentos",
          },
          {
            id: "production",
            icon: <Speaker className="h-3 w-3 " />,
            label: "Produção Musical",
          },
          {
            id: "singing",
            icon: <Mic className="h-3 w-3 " />,
            label: "Canto",
          },
        ],
      },
      {
        id: "literature",
        icon: <BookOpen className="h-4 w-4 " />,
        label: "Literatura",
        children: [
          {
            id: "reading",
            icon: <Book className="h-3 w-3 " />,
            label: "Leitura",
          },
          {
            id: "writing",
            icon: <Edit className="h-3 w-3 " />,
            label: "Escrita Criativa",
          },
          {
            id: "poetry",
            icon: <Feather className="h-3 w-3 " />,
            label: "Poesia",
          },
        ],
      },
    ],
  },
  {
    id: "lifestyle",
    icon: <Sunrise className="h-5 w-5 " />,
    label: "Estilo de Vida",
    children: [
      {
        id: "travel",
        icon: <MapPin className="h-4 w-4 " />,
        label: "Viagens",
        children: [
          {
            id: "backpacking",
            icon: <Backpack className="h-3 w-3 " />,
            label: "Mochilão",
          },
          {
            id: "roadtrips",
            icon: <Car className="h-3 w-3 " />,
            label: "Viagens de Carro",
          },
          {
            id: "culture",
            icon: <Globe className="h-3 w-3 " />,
            label: "Turismo Cultural",
          },
        ],
      },
      {
        id: "home",
        icon: <Home className="h-4 w-4 " />,
        label: "Vida Doméstica",
        children: [
          {
            id: "gardening",
            icon: <FaSeedling className="h-3 w-3 " />,
            label: "Jardinagem",
          },
          {
            id: "diy",
            icon: <Hammer className="h-3 w-3 " />,
            label: "Faça Você Mesmo (DIY)",
          },
          {
            id: "cooking",
            icon: <CookingPot className="h-3 w-3 " />,
            label: "Culinária",
          },
        ],
      },
      {
        id: "pets",
        icon: <PawPrint className="h-4 w-4 " />,
        label: "Animais de Estimação",
        children: [
          {
            id: "dogs",
            icon: <Dog className="h-3 w-3 " />,
            label: "Cães",
          },
          {
            id: "cats",
            icon: <Cat className="h-3 w-3 " />,
            label: "Gatos",
          },
          {
            id: "exotics",
            icon: <VscSnake className="h-3 w-3 " />,
            label: "Animais Exóticos",
          },
        ],
      },
    ],
  },
  {
    id: "business",
    icon: <Briefcase className="h-5 w-5 " />,
    label: "Negócios e Carreira",
    children: [
      {
        id: "entrepreneurship",
        icon: <LuBriefcaseBusiness className="h-4 w-4 " />,
        label: "Empreendedorismo",
        children: [
          {
            id: "startups",
            icon: <Coffee className="h-3 w-3 " />,
            label: "Startups",
          },
          {
            id: "marketing",
            icon: <Megaphone className="h-3 w-3 " />,
            label: "Marketing Digital",
          },
          {
            id: "finance",
            icon: <DollarSign className="h-3 w-3 " />,
            label: "Finanças Pessoais",
          },
        ],
      },
      {
        id: "development",
        icon: <UserCheck className="h-4 w-4 " />,
        label: "Desenvolvimento Pessoal",
        children: [
          {
            id: "leadership",
            icon: <Award className="h-3 w-3 " />,
            label: "Liderança",
          },
          {
            id: "productivity",
            icon: <Activity className="h-3 w-3 " />,
            label: "Produtividade",
          },
        ],
      },
    ],
  },
  {
    id: "cooking",
    icon: <ChefHat className="h-5 w-5 " />,
    label: "Culinária e Gastronomia",
    children: [
      {
        id: "cuisine-types",
        icon: <Globe className="h-4 w-4 " />,
        label: "Tipos de Culinária",
        children: [
          {
            id: "brazilian",
            icon: <GiBrazil className="h-3 w-3 " />,
            label: "Comida Brasileira",
          },
          {
            id: "italian",
            icon: <Pizza className="h-3 w-3 " />,
            label: "Culinária Italiana",
          },
          {
            id: "japanese",
            icon: <GiSushis className="h-3 w-3 " />,
            label: "Culinária Japonesa",
          },
          {
            id: "arabic",
            icon: <Croissant className="h-3 w-3 " />,
            label: "Culinária Árabe",
          },
          {
            id: "vegan-cuisine",
            icon: <Leaf className="h-3 w-3 " />,
            label: "Culinária Vegana",
          },
          {
            id: "desserts",
            icon: <Cake className="h-3 w-3 " />,
            label: "Sobremesas e Doces",
          },
        ],
      },
      {
        id: "food-business",
        icon: <Store className="h-4 w-4 " />,
        label: "Negócios de Alimentação",
        children: [
          {
            id: "restaurant",
            icon: <Utensils className="h-3 w-3 " />,
            label: "Restaurante",
          },
          {
            id: "cafe",
            icon: <Coffee className="h-3 w-3 " />,
            label: "Cafeteria",
          },
          {
            id: "foodtruck",
            icon: <Truck className="h-3 w-3 " />,
            label: "Food Truck",
          },
          {
            id: "homecooking",
            icon: <Home className="h-3 w-3 " />,
            label: "Comida Feita em Casa",
          },
          {
            id: "artisanal",
            icon: <Wheat className="h-3 w-3 " />,
            label: "Produtos Artesanais (pães, queijos, geleias...)",
          },
          {
            id: "brewery",
            icon: <Beer className="h-3 w-3 " />,
            label: "Cervejaria Artesanal",
          },
        ],
      },
      {
        id: "food-lifestyle",
        icon: <Heart className="h-4 w-4 " />,
        label: "Estilo de Vida e Alimentação",
        children: [
          {
            id: "gastronomy",
            icon: <GlassWater className="h-3 w-3 " />,
            label: "Gastronomia",
          },
          {
            id: "mealprep",
            icon: <Package className="h-3 w-3 " />,
            label: "Preparação de Marmitas",
          },
          {
            id: "fermentation",
            icon: <FlaskConical className="h-3 w-3 " />,
            label: "Fermentação Artesanal (pães, kombucha, etc)",
          },
          {
            id: "craftbeer",
            icon: <Beer className="h-3 w-3 " />,
            label: "Produção de Cerveja Artesanal",
          },
        ],
      },
    ],
  },
];

// Target audience options
const audienceOptions = [
  "Jovens (18-25)",
  "Adultos (26-35)",
  "Profissionais (36-50)",
  "Seniors (50+)",
  "Estudantes",
  "Profissionais Liberais",
  "Empresários",
  "Famílias",
  "Crianças",
  "Adolescentes",
  "Atletas",
  "Artistas",
];

// Define questions
const profileQuestions: ProfileQuestion[] = [
  // {
  //   id: 'areas',
  //   question: 'Quais áreas de negócio mais te interessam?',
  //   type: 'tags',
  //   options: businessAreas,
  // },
  {
    id: "education",
    question: "Qual o seu nível de formação?",
    type: "tags",
    options: educationLevels,
  },
  {
    id: "areas",
    question: "Qual é a área de formação",
    type: "tags",
    options: educationAreas,
  },
  {
    id: "investment",
    question: "Quanto você está disposto a investir no seu novo negócio?",
    type: "slider",
    min: 0,
    max: 50000,
    step: 1000,
    marks: [
      { value: 0, label: "Não sei" },
      { value: 1000, label: "> R$1.000" },
      { value: 10000, label: "R$10.000" },
      { value: 20000, label: "R$20.000" },
      { value: 30000, label: "R$30.000" },
      { value: 40000, label: "R$40.000" },
      { value: 50000, label: "R$50.000" },
    ],
  },
  {
    id: "time",
    question: "Quantas horas por semana você pode dedicar ao seu novo negócio?",
    type: "slider",
    min: 5,
    max: 40,
    step: 5,
    marks: [
      { value: 5, label: "5h" },
      { value: 10, label: "10h" },
      { value: 20, label: "20h" },
      { value: 30, label: "30h" },
      { value: 40, label: "40h" },
    ],
  },
  {
    id: "hobbies",
    question: "Selecione seus principais hobbies e interesses:",
    type: "tree",
    treeOptions: hobbiesTree,
  },
  {
    id: "audience",
    question:
      "Qual público-alvo você gostaria de atingir com seu produto ou serviço?",
    type: "audience-tags",
    options: audienceOptions,
  },
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserCoins(currentUser.coins);
    }

    // Load saved responses from localStorage
    const savedResponses = localStorage.getItem("entrepreneurProfile");
    const savedStep = localStorage.getItem("entrepreneurProfileStep");

    if (savedResponses) {
      const parsedResponses = JSON.parse(savedResponses);
      setResponses(parsedResponses);

      // Restore selected tags if they exist
      if (parsedResponses.areas) {
        setSelectedTags(parsedResponses.areas);
      }
      if (parsedResponses.hobbies) {
        setSelectedHobbies(parsedResponses.hobbies);
      }
    }

    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step >= 0 && step < profileQuestions.length) {
        setCurrentStep(step);
      } else {
        setCurrentStep(0);
        localStorage.setItem("entrepreneurProfileStep", "0");
      }
    }
  }, [router]);

  const handleNext = async () => {
    const currentQuestion = profileQuestions[currentStep];
    const response = responses[currentQuestion.id];

    // Validation based on question type
    if (currentQuestion.type === "tags" && !selectedTags.length) {
      toast({
        title: "Seleção necessária",
        description:
          "Por favor, selecione pelo menos uma opção para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem("entrepreneurProfile", JSON.stringify(responses));

      // Move to next question or finish
      if (currentStep < profileQuestions.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        localStorage.setItem("entrepreneurProfileStep", nextStep.toString());
      } else {
        handleFinish();
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar resposta",
        description:
          "Ocorreu um erro ao salvar sua resposta. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      localStorage.setItem("entrepreneurProfileStep", newStep.toString());
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];

      setResponses((prev) => ({
        ...prev,
        areas: newTags,
      }));

      return newTags;
    });
  };
  // TODO: fix slider
  const handleSliderChange = (value: number[], questionId: string) => {
    const currentQuestion = profileQuestions.find((q) => q.id === questionId);
    if (!currentQuestion) return;

    const markValues = currentQuestion.marks?.map((mark) => mark.value) || [];

    // Encontra o valor mais próximo dentro dos marks
    const inputValue = value[0];
    const adjustedValue = markValues.reduce((prev, curr) => {
      return Math.abs(curr - inputValue) < Math.abs(prev - inputValue)
        ? curr
        : prev;
    }, markValues[0]);

    setResponses((prev) => ({
      ...prev,
      [questionId]: adjustedValue,
    }));
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleHobbySelect = (
    hobbyId: string,
    icon: unknown,
    hobbyLabel: string
  ) => {
    setSelectedHobbies((prev) => {
      const newHobbies = prev.includes(hobbyId)
        ? prev.filter((h) => h !== hobbyId)
        : [...prev, hobbyId];

      setResponses((prev) => ({
        ...prev,
        hobbies: newHobbies,
      }));

      return newHobbies;
    });
  };

const renderTreeNode = (node: TreeOption, level: number = 0) => {
  const isExpanded = expandedNodes.includes(node.id);
  const isSelected = selectedHobbies.includes(node.id);

  return (
    <div key={node.id} className="whitespace-nowrap items-start space-x-1">
      <div className="flex items-center">
        {node.children && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleNode(node.id)}
          >
            {isExpanded ? "-" : "+"}
          </Button>
        )}
        <div
          className={`flex items-center cursor-pointer my-2 py-1 pl-1 pr-3 rounded-md ${
            isSelected
              ? "bg-accent text-primary-foreground"
              : "hover:bg-accent/10"
          }`}
          onClick={() => handleHobbySelect(node.id, node.icon, node.label)}
        >
          {node.icon && (
            <span className={`mr-1 ${isSelected ? "text-white" : "text-green-600"}`}>
              {node.icon}
            </span>
          )}
          {node.label}
        </div>
      </div>
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => renderTreeNode(child, level + 1))}
        </div>
      )}
    </div>
  );
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
        localStorage.setItem("profileCompleted", "true");
      }

      toast({
        title: "Perfil concluído!",
        description: "Você ganhou 100 moedas por completar seu perfil.",
      });

      setShowRecommendations(true);
    } catch (error) {
      toast({
        title: "Erro ao processar perfil",
        description:
          "Ocorreu um erro ao processar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionForm = () => {
    const currentQuestion = profileQuestions[currentStep];

    switch (currentQuestion.type) {
      case "tags":
        return (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => {
              const label = typeof option === "string" ? option : option.label;
              const icon =
                typeof option === "object" && option.icon ? option.icon : null;

              return (
                <Badge
                  key={label}
                  variant={selectedTags.includes(label) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1.5"
                  onClick={() => handleTagSelect(label)}
                >
                  <div className="flex items-center gap-1">
                    {icon && (
                      <span className="text-muted-foreground">{icon}</span>
                    )}
                    <span>{label}</span>
                  </div>
                </Badge>
              );
            })}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-6">
            <Slider
              defaultValue={[
                responses[currentQuestion.id] || currentQuestion.min || 0,
              ]}
              max={currentQuestion.max}
              min={currentQuestion.min}
              step={currentQuestion.step} // Define os passos fixos
              onValueChange={(value) => {
                const step = currentQuestion.step || 1;
                const adjustedValue = Math.round(value[0] / step) * step; // Arredonda para o valor mais próximo do passo
                handleSliderChange([adjustedValue], currentQuestion.id);
              }}
              value={[
                responses[currentQuestion.id] || currentQuestion.min || 0,
              ]} // Mantém o valor fixo
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              {currentQuestion.marks?.map((mark) => (
                <span key={mark.value}>{mark.label}</span>
              ))}
            </div>
          </div>
        );

      case "tree":
        return (
          <div className="flex max-h-[460px] overflow-y-auto border rounded-lg p-6">
            {currentQuestion.treeOptions?.map((node) => renderTreeNode(node))}
          </div>
        );

      case "audience-tags":
        return (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => {
              const label = typeof option === "string" ? option : option.label;
              return (
                <Badge
                  key={label}
                  variant={selectedTags.includes(label) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1.5"
                  onClick={() => handleTagSelect(label)}
                >
                  {label}
                </Badge>
              );
            })}
          </div>
        );

      default:
        return null;
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
                  ? "bg-secondary text-secondary-foreground"
                  : index === currentStep
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h1 className="text-3xl font-bold">Perfil Concluído!</h1>
            <p className="text-muted-foreground mt-2">
              Com base nas suas respostas, identificamos alguns nichos que podem
              ser ideais para você.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {recommendations.map((rec, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Send className="h-5 w-5 mr-2 text-secondary" />
                        {rec.niche}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Potencial:{" "}
                        <span className="font-semibold">{rec.potential}</span>
                      </CardDescription>
                    </div>
                    <Button variant="secondary" size="sm">
                      Explorar Este Nicho
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-card-foreground mb-4">{rec.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded-md">
                      <span className="block text-muted-foreground mb-1">
                        Investimento Aproximado
                      </span>
                      <span className="font-medium">{rec.investmentRange}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <span className="block text-muted-foreground mb-1">
                        Tempo Necessário
                      </span>
                      <span className="font-medium">{rec.timeCommitment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button onClick={() => router.push("/pesquisa-nicho")}>
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
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Perfil Empreendedor</CardTitle>
            <CardDescription>
              Vamos ajudar você a encontrar o nicho ideal para seu negócio.
              Responda as perguntas abaixo para que possamos entender melhor o
              seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderProgressSteps()}

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {profileQuestions[currentStep].question}
              </h2>
              <div className="mt-4">{renderQuestionForm()}</div>
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
            <Button onClick={handleNext} disabled={isLoading}>
              {currentStep === profileQuestions.length - 1 ? (
                <>
                  {isLoading ? "Processando..." : "Finalizar"}
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

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Dica</h3>
              <p className="text-sm text-muted-foreground">
                Selecione todas as opções que se aplicam ao seu perfil. Quanto
                mais informações você fornecer, melhores serão nossas
                recomendações.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
