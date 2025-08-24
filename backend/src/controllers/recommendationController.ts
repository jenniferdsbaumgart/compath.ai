import { Request, Response } from 'express';
import { fetchRecommendationsFromPython } from '../services/knnService';
import { transformProfileToFeatures } from '../utils/transformProfile';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const profile = req.body;

    const features = transformProfileToFeatures(profile);

    const result = await fetchRecommendationsFromPython({ features });

    const recommendation = {
      profile: result.profile || 'Empreendedor',
      niche: result.recommendation,
      description: result.description || 'Este nicho foi selecionado com base no seu perfil.',
      potential: result.potential || 'Alto',
      investmentRange: result.investmentRange || 'R$5.000 – R$25.000',
      timeCommitment: result.timeCommitment || '20h/semana',
      actionButton: result.actionButton || 'Explorar este nicho',
    };

    return res.json({ recommendations: [recommendation] });
  } catch (err) {
    console.error('Erro ao gerar recomendação:', err);
    res.status(500).json({ error: 'Erro ao gerar recomendação' });
  }
}
