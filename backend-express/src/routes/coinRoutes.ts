import express from 'express';
import User from '../models/User';

const router = express.Router();

// POST /api/coins/add
router.post('/add', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).send('Usuário não encontrado');

  user.coins += amount;
  await user.save();

  res.json({ coins: user.coins });
});

// POST /api/coins/spend
router.post('/spend', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user || user.coins < amount) return res.status(400).send('Saldo insuficiente');

  user.coins -= amount;
  await user.save();

  res.json({ coins: user.coins });
});

export default router;
