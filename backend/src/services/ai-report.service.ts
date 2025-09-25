import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiReportService {
  private readonly logger = new Logger(AiReportService.name);
  private openai: OpenAI | null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  private monthLabels() {
    return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  }

  private clampText(s: string, max: number) {
    if (!s) return s;
    return s.length > max ? s.slice(0, max).trim() + '…' : s;
  }

  private tryParseJson(text?: string | null) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {}
    const i = text.indexOf('{');
    const j = text.lastIndexOf('}');
    if (i >= 0 && j > i) {
      try {
        return JSON.parse(text.slice(i, j + 1));
      } catch {}
    }
    return null;
  }

  private parsePct(s?: string | number) {
    if (typeof s === 'number') return s;
    if (!s) return 0;
    const n = Number(String(s).replace(/[^\d.,-]/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  private injectVisibilityIndex(keyPlayers: any[] = []) {
    const withMs = keyPlayers.map(k => ({
      ...k,
      __ms: this.parsePct(k.marketShare),
    }));
    const max = Math.max(...withMs.map(k => k.__ms), 0);
    if (max > 0) {
      return withMs.map(k => ({
        ...k,
        visibilityIndex: Math.round((k.__ms / max) * 100),
      }));
    }
    const base = [100, 82, 68, 51, 37, 29, 23, 19, 15, 12];
    return withMs.map((k, i) => ({ ...k, visibilityIndex: base[i] ?? 10 }));
  }

  private buildPrompt(userInput: string) {
    return `
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
`.trim();
  }

  private getStubReport(topic: string) {
    const players = [
      { name: `${topic} Prime`, marketShare: '25%' },
      { name: `${topic} Central`, marketShare: '18%' },
      { name: `${topic} Express`, marketShare: '14%' },
      { name: `${topic} & Cia`, marketShare: '10%' },
      { name: `${topic} Studio`, marketShare: '7%' },
    ];
    const keyPlayers = this.injectVisibilityIndex(players);

    const base = Array.from({ length: 12 }, (_, i) => ({ month: this.monthLabels()[i], demandIndex: 6 }));
    base[0].demandIndex = 7; base[1].demandIndex = 7; base[5].demandIndex = 9;
    base[6].demandIndex = 10; base[7].demandIndex = 11; base[11].demandIndex = 8;
    const sum = base.reduce((a, b) => a + b.demandIndex, 0);
    base.forEach(x => x.demandIndex = Math.round((x.demandIndex / sum) * 100));
    const diff = 100 - base.reduce((a, b) => a + b.demandIndex, 0);
    base[6].demandIndex += diff;

    return {
      title: `Análise de ${topic}`,
      marketSize: 'R$ 12–18 milhões/ano (estimado)',
      growthRate: this.clampText('Crescimento moderado impulsionado por demanda local', 70),
      competitionLevel: 'Média',
      entryBarriers: this.clampText('Exige ponto estratégico, capital inicial e branding consistente', 140),
      targetAudience: ['moradores locais', 'trabalhadores', 'turistas'],
      customerSegments: [
        { name: 'Clientes recorrentes', percentage: 38 },
        { name: 'Novos clientes', percentage: 27 },
        { name: 'Turistas', percentage: 20 },
        { name: 'Corporativo', percentage: 15 },
      ],
      keyPlayers,
      opportunities: [
        'Parcerias locais e combos semanais',
        'Programas de fidelidade digitais',
        'Marketing de conteúdo no Instagram/TikTok',
        'Ampliação do horário de pico',
        'Upsell de serviços complementares',
      ],
      challenges: [
        'Variação de fluxo por sazonalidade',
        'Pressão por preço dos concorrentes',
        'Dependência de localização',
        'Custos de aquisição elevados',
        'Retenção após primeira compra',
      ],
      recommendations: [
        'Diferenciar proposta de valor e nicho',
        'Implantar CRM leve e gatilhos de retorno',
        'Testes A/B em ofertas e vitrines',
        'Fortalecer reviews e prova social',
        'Padronizar operações e SLAs',
      ],
      strengths: [
        'Proximidade do público-alvo',
        'Equipe enxuta e ágil',
        'Custos fixos controlados',
        'Marca com potencial de identidade',
        'Rapidez na execução',
      ],
      weaknesses: [
        'Baixa notoriedade inicial',
        'Dependência do fundador',
        'Canal digital pouco explorado',
        'Baixo ticket médio em dias úteis',
        'Pouca automação de marketing',
      ],
      seasonality: base,
    };
  }

  async generateMarketReport(userInput: string): Promise<any> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured, using stub report');
      return this.getStubReport(userInput);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: this.buildPrompt(userInput) }],
        temperature: 0.5,
        max_tokens: 1200,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      const parsed: any = this.tryParseJson(text);

      if (parsed && typeof parsed === 'object') {
        parsed.title = String(parsed.title || `Análise de ${userInput}`).trim();
        parsed.growthRate = this.clampText(parsed.growthRate ?? '', 70);
        parsed.entryBarriers = this.clampText(parsed.entryBarriers ?? '', 140);

        if (Array.isArray(parsed.keyPlayers)) {
          parsed.keyPlayers = this.injectVisibilityIndex(parsed.keyPlayers);
        }

        return parsed;
      }

      this.logger.error('OpenAI returned unexpected format. Using fallback stub.', { text });
      return this.getStubReport(userInput);
    } catch (err) {
      this.logger.error('Failed to call OpenAI. Using fallback stub.', err);
      return this.getStubReport(userInput);
    }
  }
}
