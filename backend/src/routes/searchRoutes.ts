import express from 'express';
import Search from '../models/Search';

const router = express.Router();

// Recebe uma consulta de pesquisa e salva no banco de dados
// Retorna a resposta gerada pela IA (placeholder)
router.post('/', async (req, res) => {
  const { userId, query } = req.body;

  const result = "Resposta gerada pela IA (placeholder)";

  const search = new Search({ userId, query, result });
  await search.save();

  res.json(search);
});

// Retorna o histórico de pesquisas de um usuário
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const history = await Search.find({ userId }).sort({ createdAt: -1 });
  res.json(history);
});

export default router;