import { Request, Response } from "express";
import { generateMarketReport } from "../services/aiReportService";
import Report from "../models/Report";

function normalizeIncomingReport(raw: any) {
  const r = { ...(raw || {}) };

  if (typeof r.targetAudience === "string") {
    r.targetAudience = r.targetAudience
      .split(/,| e /i)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (!Array.isArray(r.targetAudience)) r.targetAudience = [];

  if (Array.isArray(r.customerSegments)) {
    r.customerSegments = r.customerSegments
      .map((s: any) => ({
        name: String(s?.name ?? "").trim(),
        percentage: Number(s?.percentage ?? s?.value ?? 0),
      }))
      .filter((s: any) => s.name && Number.isFinite(s.percentage));
  } else {
    r.customerSegments = [];
  }

  const listKeys = [
    "keyPlayers",
    "opportunities",
    "challenges",
    "recommendations",
    "strengths",
    "weaknesses",
  ];
  for (const k of listKeys) {
    if (!Array.isArray(r[k])) r[k] = [];
  }

  r.keyPlayers = r.keyPlayers
    .map((kp: any) => ({
      name: String(kp?.name ?? "").trim(),
      marketShare: String(kp?.marketShare ?? "").trim(),
    }))
    .filter((kp: any) => kp.name);

  return r;
}

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
    const { userId, searchQuery, report } = req.body || {};
    if (!userId || !searchQuery || !report) {
      return res
        .status(400)
        .json({ success: false, error: "Campos obrigatórios: userId, searchQuery, report" });
    }

    const normalized = normalizeIncomingReport(report);

    const schema: any = Report.schema;
    const taType = schema.path("report.targetAudience")?.instance; // "String" | "Array"
    if (taType === "String" && Array.isArray(normalized.targetAudience)) {
      normalized.targetAudience = normalized.targetAudience.join(", ");
    }

    if (!schema.path("report.customerSegments")) {
      delete normalized.customerSegments;
    }

    const saved = await Report.create({
      userId,
      searchQuery,
      report: normalized,
    });

    return res.status(201).json({
      success: true,
      message: "Relatório salvo com sucesso",
      reportId: saved._id,
    });
  } catch (error: any) {
    
    console.error("Erro ao salvar relatório:", error?.message, error?.errors ?? error);
    return res
      .status(500)
      .json({ success: false, error: error?.message || "Erro ao salvar relatório" });
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, error: "Relatório não encontrado" });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    return res.status(500).json({ success: false, error: "Erro ao buscar relatório" });
  }
}