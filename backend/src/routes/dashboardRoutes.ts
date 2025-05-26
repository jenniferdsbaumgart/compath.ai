import express from 'express';
import Search from '../models/Search';
import User from '../models/User';

const router = express.Router();

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  const searchCount = await Search.countDocuments({ userId });

  res.json({
    coins: user?.coins || 0,
    searchCount,
    activeCourses: [] // A preencher futuramente
  });
});

export default router;
