import { Request, Response } from "express";
import { generateMarketReport } from "../services/aiReportService";
import Report from '../models/Report';

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

export async function saveReport(req: Request, res: Response) {
  try {
    const { userId, searchQuery, report } = req.body;

    const newReport = new Report({ userId, searchQuery, report });
    const saved = await newReport.save();

    return res.status(201).json({
      success: true,
      message: 'Relatório salvo com sucesso',
      reportId: saved._id,
    });
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    return res.status(500).json({ success: false, error: 'Erro ao salvar relatório' });
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar relatório' });
  }
}