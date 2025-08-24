import { Request, Response } from 'express';
import Profile from '../models/UserProfile'

export async function saveProfile(req: Request, res: Response) {
  try {
    const { features, label } = req.body;
    const profile = new Profile({ features, label });
    await profile.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar perfil' });
  }
}