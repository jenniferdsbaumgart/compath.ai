import express from "express";
import {
  generateAiReport,
  getReportById,
  saveReport,
} from "../controllers/aiReportController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  validateRequest,
  aiReportSchemas,
} from "../middleware/validationMiddleware";

const router = express.Router();

// Generate report (requires auth for coin deduction)
router.post(
  "/generate-report",
  authMiddleware,
  validateRequest(aiReportSchemas.generateReport),
  generateAiReport
);

// Save and get reports require authentication
router.post(
  "/",
  authMiddleware,
  validateRequest(aiReportSchemas.saveReport),
  saveReport
);
router.get("/:id", authMiddleware, getReportById);

export default router;
