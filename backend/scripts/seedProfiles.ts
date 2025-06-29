import mongoose from 'mongoose';
import Profile from '../src/models/Profile';
import dotenv from 'dotenv';
dotenv.config();

const profiles = [
  {
    name: "Social",
    niches: [
      {
        profile: "Social",
        niche: "Loja de Produtos Naturais",
        description: "Se você se identifica com um estilo de vida saudável e quer promover bem-estar, abrir uma loja de produtos naturais pode ser o seu caminho.",
        potential: "Alto",
        investmentRange: "R$500 – R$3.000",
        timeCommitment: "Alta dedicação (6-8h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Social",
        niche: "Eventos Comunitários",
        description: "Organize feiras, bazares ou eventos culturais para fortalecer a comunidade e gerar renda.",
        potential: "Médio",
        investmentRange: "R$500 – R$5.000",
        timeCommitment: "Moderado (4-6h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Social",
        niche: "Brechó Solidário",
        description: "Venda roupas e itens de segunda mão, promovendo consumo consciente e apoiando causas sociais.",
        potential: "Alto",
        investmentRange: "R$200 – R$2.000",
        timeCommitment: "Parcial (4h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Social",
        niche: "Serviços de Pet Sitting",
        description: "Ofereça cuidados e passeios para animais de estimação de pessoas ocupadas ou idosas.",
        potential: "Médio",
        investmentRange: "R$100 – R$500",
        timeCommitment: "Flexível, conforme demanda",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Social",
        niche: "Consultoria de Bem-Estar",
        description: "Ajude pessoas a equilibrarem saúde mental, alimentação e rotina saudável com planos personalizados.",
        potential: "Alto",
        investmentRange: "R$500 – R$3.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
    ],
  },
  {
    name: "Analítico",
    niches: [
      {
        profile: "Analítico",
        niche: "Mercearia",
        description: "Para quem tem um perfil organizador e gosta de atender às necessidades da comunidade local, uma mercearia é um negócio com demanda constante.",
        potential: "Médio",
        investmentRange: "R$15.000 – R$50.000",
        timeCommitment: "Tempo integral (8h+ por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Analítico",
        niche: "Consultoria Financeira Pessoal",
        description: "Ajude pessoas a organizar finanças, criar orçamentos e atingir metas com controle e estratégia.",
        potential: "Alto",
        investmentRange: "R$0 – R$2.000",
        timeCommitment: "Flexível, conforme clientes",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Analítico",
        niche: "Agência de Pesquisa de Mercado",
        description: "Realize análises para empresas que precisam entender o mercado local antes de lançar produtos.",
        potential: "Alto",
        investmentRange: "R$5.000 – R$20.000",
        timeCommitment: "Integral (6-8h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Analítico",
        niche: "Serviços de Contabilidade Online",
        description: "Ofereça gestão contábil remota para pequenos empreendedores e freelancers.",
        potential: "Alto",
        investmentRange: "R$2.000 – R$10.000",
        timeCommitment: "Integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Analítico",
        niche: "Consultoria em Otimização de Processos",
        description: "Apoie empresas a reduzirem custos e melhorarem eficiência operacional.",
        potential: "Alto",
        investmentRange: "R$1.000 – R$5.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
    ],
  },
  {
    name: "Criativo",
    niches: [
      {
        profile: "Criativo",
        niche: "Loja de Presentes e Decoração",
        description: "Se você tem bom gosto, adora encontrar objetos criativos e ajudar as pessoas a expressarem carinho, uma loja de presentes e decoração é a sua cara.",
        potential: "Alto",
        investmentRange: "R$10.000 – R$25.000",
        timeCommitment: "Alta dedicação, especialmente em picos sazonais (6-8h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Criativo",
        niche: "Criação de Filtros e Efeitos AR",
        description: "Desenvolva filtros personalizados para marcas e influenciadores nas redes sociais.",
        potential: "Alto",
        investmentRange: "R$0 – R$1.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Criativo",
        niche: "Design de Papelaria Personalizada",
        description: "Crie planners, adesivos e papelaria digital ou física para vendas online.",
        potential: "Médio",
        investmentRange: "R$300 – R$2.000",
        timeCommitment: "Flexível",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Criativo",
        niche: "Loja de Produtos Customizados",
        description: "Venda camisetas, canecas e itens personalizados com estampas autorais e exclusivas.",
        potential: "Alto",
        investmentRange: "R$1.000 – R$10.000",
        timeCommitment: "Parcial (4-6h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Criativo",
        niche: "Produção de Podcasts",
        description: "Crie conteúdos em áudio sobre temas de interesse público ou de marcas.",
        potential: "Médio",
        investmentRange: "R$500 – R$5.000",
        timeCommitment: "Flexível",
        actionButton: "Explorar este nicho"
      },
    ],
  },
  {
    name: "Comunicador",
    niches: [
      {
        profile: "Comunicador",
        niche: "Lanchonete",
        description: "Se você gosta de um ambiente dinâmico, de servir trabalhadores e jovens, e oferecer lanches saborosos, uma lanchonete pode ser um negócio movimentado e lucrativo.",
        potential: "Alto",
        investmentRange: "R$20.000 – R$80.000",
        timeCommitment: "Tempo integral e intenso (8-10h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Comunicador",
        niche: "Agência de Marketing Digital",
        description: "Ofereça serviços de social media, branding e tráfego pago para empresas locais.",
        potential: "Alto",
        investmentRange: "R$2.000 – R$10.000",
        timeCommitment: "Integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Comunicador",
        niche: "Criação de Conteúdo para YouTube",
        description: "Produza vídeos informativos, tutoriais ou vlogs para monetização online.",
        potential: "Alto",
        investmentRange: "R$1.000 – R$5.000",
        timeCommitment: "Alta dedicação (6-8h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Comunicador",
        niche: "Podcast de Entrevistas",
        description: "Crie podcasts que tragam convidados relevantes para discussões sobre temas atuais.",
        potential: "Médio",
        investmentRange: "R$500 – R$2.000",
        timeCommitment: "Parcial (4-6h por dia)",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Comunicador",
        niche: "Narração e Locução",
        description: "Grave áudios para vídeos, podcasts, audiobooks e publicidade.",
        potential: "Médio",
        investmentRange: "R$300 – R$2.000",
        timeCommitment: "Flexível",
        actionButton: "Explorar este nicho"
      },
    ],
  },
  {
    name: "Técnico",
    niches: [
      {
        profile: "Técnico",
        niche: "Manutenção e Reparo de Computadores",
        description: "Seu conhecimento técnico pode resolver problemas e manter equipamentos funcionando.",
        potential: "Médio",
        investmentRange: "R$300 – R$1.500",
        timeCommitment: "Flexível, conforme demanda",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Técnico",
        niche: "Desenvolvimento de Dashboards Inteligentes",
        description: "Crie dashboards interativos para empresas acompanharem seus KPIs em tempo real.",
        potential: "Alto",
        investmentRange: "R$500 – R$5.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Técnico",
        niche: "Consultoria de Software",
        description: "Ajude empresas a escolherem, implementarem ou desenvolverem sistemas sob medida.",
        potential: "Alto",
        investmentRange: "R$1.000 – R$10.000",
        timeCommitment: "Integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Técnico",
        niche: "Instalação de Redes e Conectividade",
        description: "Configure redes de internet e conectividade em empresas ou residências.",
        potential: "Médio",
        investmentRange: "R$500 – R$3.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
      {
        profile: "Técnico",
        niche: "Consultoria em Cibersegurança",
        description: "Ofereça análises e implementações de segurança digital para pequenas empresas.",
        potential: "Alto",
        investmentRange: "R$2.000 – R$15.000",
        timeCommitment: "Parcial ou integral",
        actionButton: "Explorar este nicho"
      },
    ],
  },
];

async function seedProfiles() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI as string);
    await Profile.deleteMany({});
    await Profile.insertMany(profiles);
    console.log('Profiles seeded successfully');
  } catch (error) {
    console.error('Error seeding profiles:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedProfiles();
