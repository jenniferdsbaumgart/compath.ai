import mongoose from 'mongoose';
import Profile from '../../backend/src/models/Profile';
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
    ],
  },
  {
    name: "Criativo",
    niches: [
      {
        profile: "Criativo",
        niche: "Loja de Presentes e Decoração",
        description: "Se você tem bom gosto, adora encontrar objetos Criativos e ajudar as pessoas a expressarem carinho, uma loja de presentes e decoração é a sua cara.",
        potential: "Alto",
        investmentRange: "R$10.000 – R$25.000",
        timeCommitment: "Alta dedicação, especialmente em picos sazonais (6-8h por dia)",
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