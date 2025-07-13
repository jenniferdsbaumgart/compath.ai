import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateMarketReport = async (userInput: string) => {
  const prompt = `
Você é uma IA especializada em análise de mercado. Com base na ideia de negócio descrita abaixo, gere um relatório detalhado com os seguintes tópicos:

1. Tamanho do mercado e taxa de crescimento.
2. Nível de competição e barreiras de entrada.
3. Público-alvo.
4. Principais concorrentes e participação de mercado (pode ser estimado).
5. Oportunidades de negócio.
6. Desafios para novos entrantes.
7. Recomendações estratégicas para iniciar nesse nicho.
8. Pontos fortes e fracos do nicho, considerando localização e tendências.

Entrada do usuário:
"${userInput}"

Seu output deve ser em formato JSON com as chaves: marketSize, growthRate, competitionLevel, entryBarriers, targetAudience, keyPlayers (array com nome e marketShare), opportunities (array), challenges (array), recommendations (array), strengths (array), weaknesses (array).
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = completion.choices[0].message.content;

  return JSON.parse(text || "{}");
};
