import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateMarketReport = async (userInput: string) => {
  const prompt = `
Você é uma IA especializada em análise de mercado. Com base na ideia de negócio descrita abaixo, gere um relatório detalhado com as seguintes seções — e retorne tudo em **português** (conteúdo, descrições e listas), mas mantenha os nomes das **chaves em inglês**, conforme o formato especificado.

Inclua as seguintes informações:

1. Título do relatório: uma frase curta combinando o nicho e a localização (ex: "Consultórios odontológicos em Belo Horizonte").
2. Tamanho do mercado e taxa de crescimento.
3. Nível de competição e barreiras de entrada.
4. Público-alvo.
5. Principais concorrentes e participação de mercado (pode ser estimado).
6. Oportunidades de negócio.
7. Desafios para novos entrantes.
8. Recomendações estratégicas.
9. Pontos fortes e fracos do nicho, considerando localização e tendências.

O output deve ser um **JSON** com as seguintes chaves (sem alterar os nomes):

{
  "title": "string",
  "marketSize": "string",
  "growthRate": "string",
  "competitionLevel": "string",
  "entryBarriers": "string",
  "targetAudience": "string",
  "keyPlayers": [ { "name": "string", "marketShare": "string" } ],
  "opportunities": ["string", ...],
  "challenges": ["string", ...],
  "recommendations": ["string", ...],
  "strengths": ["string", ...],
  "weaknesses": ["string", ...]
}

Entrada do usuário:
"${userInput}"

Retorne apenas o JSON, sem explicações adicionais.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = completion.choices[0].message.content?.trim();

  try {
    const parsed = JSON.parse(text!);
    return parsed;
  } catch (error) {
    console.error("Erro ao fazer parse do JSON da OpenAI:", text);
    throw new Error("Resposta da IA não está em formato JSON válido.");
  }
};