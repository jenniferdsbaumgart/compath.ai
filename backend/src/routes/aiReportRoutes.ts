import express from "express";
import { generateAiReport } from "../controllers/aiReportController";

const router = express.Router();

router.post("/generate-report", generateAiReport);

export default router;