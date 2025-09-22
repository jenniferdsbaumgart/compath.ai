// controllers/aiReportController.ts
import { Request, Response } from "express";
import Report from "../models/Report";
import { generateMarketReport } from "../services/aiReportService";
import { logger, logError, logBusiness } from "../utils/logger";

/* ------------------------------------------------------------------ */
/* Normalização só do que o schema aceita                             */
/* ------------------------------------------------------------------ */
function normalizeIncomingReport(raw: any) {
  const r = { ...(raw || {}) };

  // title (opcional)
  if (raw?.title) r.title = String(raw.title).trim();

  // targetAudience: string -> array (o front prefere array)
  if (typeof r.targetAudience === "string") {
    r.targetAudience = r.targetAudience
      .split(/,| e /i)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (!Array.isArray(r.targetAudience)) r.targetAudience = [];

  // customerSegments: normaliza shape, mas pode ser removido no save (schema não tem)
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

  // listas garantidas
  const listKeys = [
    "keyPlayers",
    "opportunities",
    "challenges",
    "recommendations",
    "strengths",
    "weaknesses",
  ];
  for (const k of listKeys) if (!Array.isArray(r[k])) r[k] = [];

  // keyPlayers: só os campos que o schema conhece
  r.keyPlayers = (Array.isArray(r.keyPlayers) ? r.keyPlayers : [])
    .map((kp: any) => ({
      name: String(kp?.name ?? "").trim(),
      marketShare:
        kp?.marketShare != null ? String(kp.marketShare).trim() : undefined,
      visibilityIndex: Number.isFinite(Number(kp?.visibilityIndex))
        ? Number(kp.visibilityIndex)
        : undefined,
    }))
    .filter((kp: any) => kp.name);

  // fontes e dataQuality (schema aceita "verified" | "no_evidence")
  if (!Array.isArray(r.sources)) r.sources = [];
  if (r.dataQuality !== "verified") r.dataQuality = "no_evidence";

  return r;
}

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const generateAiReport = async (req: Request, res: Response) => {
  try {
    const { userInput } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado.",
      });
    }

    // Import User model here to avoid circular dependencies
    const User = (await import("../models/User")).default;

    // Check if user has enough coins (cost: 10 coins per report)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado.",
      });
    }

    const reportCost = 10;
    if (user.coins < reportCost) {
      return res.status(400).json({
        success: false,
        error:
          "Moedas insuficientes. Você precisa de 10 moedas para gerar um relatório.",
        requiredCoins: reportCost,
        userCoins: user.coins,
      });
    }

    // Generate the report
    const report = await generateMarketReport(userInput);

    // Deduct coins after successful generation
    user.coins -= reportCost;
    await user.save();

    return res.status(200).json({
      success: true,
      report,
      coinsSpent: reportCost,
      remainingCoins: user.coins,
    });
  } catch (error) {
    logError(error as Error, "generateAiReport");
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
    });
  }
};

export async function saveReport(req: Request, res: Response) {
  try {
    const { userId, searchQuery, report } = (req.body ?? {}) as {
      userId?: string;
      searchQuery?: string;
      report?: unknown;
    };

    if (!userId || !searchQuery || !report) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios: userId, searchQuery, report",
      });
    }

    const normalized = normalizeIncomingReport(report);

    // compat: schema atual espera targetAudience como String
    const schema: any = Report.schema;
    const taType = schema.path("report.targetAudience")?.instance; // "String" | "Array"
    if (taType === "String" && Array.isArray(normalized.targetAudience)) {
      normalized.targetAudience = normalized.targetAudience.join(", ");
    }

    // remover campos que o schema não tem (evita ValidationError)
    if (!schema.path("report.customerSegments"))
      delete (normalized as any).customerSegments;
    if (!schema.path("report.seasonality"))
      delete (normalized as any).seasonality;

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
    logError(error as Error, "saveReport");
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro ao salvar relatório",
    });
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const report = await Report.findById(id);

    if (!report) {
      return res
        .status(404)
        .json({ success: false, error: "Relatório não encontrado" });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    logError(error as Error, "getReportById");
    return res
      .status(500)
      .json({ success: false, error: "Erro ao buscar relatório" });
  }
}
