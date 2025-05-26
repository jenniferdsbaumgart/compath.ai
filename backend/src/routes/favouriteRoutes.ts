import express from 'express';
import User from '../models/User';

const router = express.Router();

// Adicionar resultado aos favoritos
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const favourite = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    user.favourites = user.favourites ?? [];
    user.favourites.push(favourite);
    await user.save();

    res.status(201).json({ message: 'Favorito adicionado', favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// Listar favoritos do usuário
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json(user.favourites);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Remover favorito pelo índice
router.delete('/:userId/:index', async (req, res) => {
  const { userId, index } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    user.favourites = user.favourites ?? [];
    user.favourites.splice(Number(index), 1);
    await user.save();

    res.json({ message: 'Favorito removido', favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

export default router;
