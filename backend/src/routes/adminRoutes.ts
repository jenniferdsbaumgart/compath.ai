import express from 'express';
import { retrainModel } from '../controllers/adminController';
const router = express.Router();
router.post('/retrain', retrainModel);
export default router;