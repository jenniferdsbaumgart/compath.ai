import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController';

const router = Router();

router.post('/', getRecommendations); // responde POST /api/users/profile/recommendations

export default router;
