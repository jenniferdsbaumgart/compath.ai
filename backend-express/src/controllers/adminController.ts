import { Request, Response } from 'express';
import axios from 'axios';

export async function retrainModel(req: Request, res: Response) {
  try {
    const result = await axios.post('http://compath-knn:8000/retrain');
    return res.json({ success: true, accuracy: result.data.accuracy });
  } catch (error) {
    console.error("Erro ao re-treinar modelo:", error);
    return res.status(500).json({ error: "Erro ao re-treinar o modelo." });
  }
}