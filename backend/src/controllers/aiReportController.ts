import { Request, Response } from "express";
import { generateMarketReport } from "../services/aiReportService";

export const generateAiReport = async (req: Request, res: Response) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput.trim() === "") {
      return res.status(400).json({ error: "Texto de entrada é obrigatório." });
    }

    const report = await generateMarketReport(userInput);
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};
