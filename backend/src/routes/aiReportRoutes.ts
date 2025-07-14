import express from "express";
import { generateAiReport, getReportById, saveReport } from "../controllers/aiReportController";

const router = express.Router();

router.post("/generate-report", generateAiReport);
router.post('/', saveReport);
router.get('/:id', getReportById);

export default router;