import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateMarketReport = async (userInput: string) => {
  const prompt = `
  Você é uma IA de análise de mercado. Gere um relatório **em português**.
  Mantenha os **nomes das chaves em inglês**. Seja conciso (sem parágrafos longos).

  Restrições de concisão:
  - "growthRate": até 70 caracteres.
  - "competitionLevel": **uma única palavra** entre: "Baixa", "Média", "Alta".
  - "entryBarriers": **uma frase** até 140 caracteres.
  - Listas ("opportunities", "challenges", "recommendations", "strengths", "weaknesses"): **máx. 5 itens**, cada item até **100** caracteres.
  - "targetAudience": **array** de **3 a 5** itens, cada item com **1–3 palavras** (ex.: "moradores locais", "turistas").
  - "customerSegments": **3 a 5** itens no formato { "name": string, "percentage": number } com **soma = 100**,
    **não** distribua igualmente (evite empates); diferença mínima de **5 pontos** entre pelo menos dois segmentos;
    um segmento líder entre **30% e 45%**.

  Inclua também:
  - "seasonality": 12 itens { "month": "Jan", "demandIndex": number } somando **100** (varie por estação).

  Formato **exato** do JSON:
  {
    "title": "string",
    "marketSize": "string",
    "growthRate": "string",
    "competitionLevel": "string",
    "entryBarriers": "string",
    "targetAudience": ["string", "..."],
    "customerSegments": [{ "name": "string", "percentage": 0 }],
    "keyPlayers": [ { "name": "string", "marketShare": "string" } ],
    "opportunities": ["string", "..."],
    "challenges": ["string", "..."],
    "recommendations": ["string", "..."],
    "strengths": ["string", "..."],
    "weaknesses": ["string", "..."],
    "seasonality": [{ "month": "Jan", "demandIndex": 0 }]
  }

  Entrada do usuário:
  "${userInput}"

  Retorne **apenas** o JSON válido, sem comentários.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
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
