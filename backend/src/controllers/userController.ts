import { Request, Response } from 'express';
import User from '../models/User';

// Extending Express Request interface to include 'user' and 'file'
declare global {
  namespace Express {
    interface User {
      id: string;
    }
    interface Request {
      user?: User;
      // Do not redeclare 'file' here; Multer already provides its type.
    }
  }
}

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // Validação de tamanho máximo (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB em bytes
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: 'O arquivo excede o limite de 2MB.' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      message: 'Avatar atualizado com sucesso.',
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
